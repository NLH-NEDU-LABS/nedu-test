export default function AssessmentResultView({ 
  title, 
  typeLabel, 
  description 
}: { 
  title: string; 
  typeLabel: string; 
  description?: string; 
}) {
  return (
    <div className="max-w-2xl mx-auto p-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
      <div className="text-6xl font-extrabold text-[#8B5E3C] mb-6">{typeLabel}</div>
      {description ? (
        <div className="text-gray-700 text-lg leading-relaxed text-left bg-[#FAF8F5] p-6 rounded-xl border border-[#EAE3DC]">
          {description.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-lg">Đang hiển thị kết quả. Vui lòng check email để nhận báo cáo chi tiết.</p>
      )}
    </div>
  );
}
