import { NextResponse } from 'next/server';

/**
 * GET /api/geocode?q=Nha+Trang
 *
 * Proxy to GeoNames searchJSON so the username stays server-side.
 * Returns simplified results: { name, adminName1, countryName, lat, lng, timezone }
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const username = process.env.GEONAMES_USERNAME;
  if (!username) {
    console.error('GEONAMES_USERNAME env var is not set');
    return NextResponse.json({ error: 'Geocode service not configured' }, { status: 500 });
  }

  try {
    const url = new URL('https://secure.geonames.org/searchJSON');
    url.searchParams.set('name_startsWith', query);
    url.searchParams.set('featureClass', 'P');       // only populated places
    url.searchParams.set('style', 'FULL');            // include timezone data
    url.searchParams.set('maxRows', '8');
    url.searchParams.set('orderby', 'population');   // most-populated first
    url.searchParams.set('lang', 'vi');               // Vietnamese labels when available
    url.searchParams.set('username', username);

    const res = await fetch(url.toString(), { next: { revalidate: 86400 } }); // cache 24h
    const data = await res.json();

    if (!data.geonames) {
      return NextResponse.json([]);
    }

    const results = data.geonames.map((g: any) => ({
      name: g.name,
      adminName1: g.adminName1 || '',             // state / province
      countryName: g.countryName || '',
      countryCode: g.countryCode || '',
      lat: parseFloat(g.lat),
      lng: parseFloat(g.lng),
      // GeoNames returns timezone info in the timezone field
      timezone: g.timezone?.gmtOffset != null
        ? formatGmtOffset(g.timezone.gmtOffset)
        : '+07:00',
      timezoneId: g.timezone?.timeZoneId || '',
    }));

    return NextResponse.json(results);
  } catch (err) {
    console.error('GeoNames API error:', err);
    return NextResponse.json({ error: 'Geocode lookup failed' }, { status: 502 });
  }
}

function formatGmtOffset(offset: number): string {
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  const hours = Math.floor(abs);
  const minutes = Math.round((abs - hours) * 60);
  return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
