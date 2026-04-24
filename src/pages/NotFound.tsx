import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-[100dvh] text-center p-8">
      <h1 className="text-3xl font-light mb-2 text-[#1A1A1A]">Không tìm thấy trang</h1>
      <p className="text-sm text-[#8B7E74] mb-6">Đường dẫn không tồn tại hoặc đã hết hạn.</p>
      <Link to="/" className="text-[#8B5E3C] font-medium underline underline-offset-4">
        Quay về trang chủ
      </Link>
    </main>
  );
}
