export default function Navbar() {
  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">CryptoLive</h1>

      <div className="flex gap-6">
        <a href="/" className="hover:text-blue-400">Home</a>
        <a href="/dashboard" className="hover:text-blue-400">Dashboard</a>
        <a href="/login" className="hover:text-blue-400">Login</a>
      </div>
    </nav>
  );
}
