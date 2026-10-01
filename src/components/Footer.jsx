export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-4 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} MatchHub · Data by{' '}
      <a href="https://www.football-data.org" target="_blank" rel="noreferrer" className="text-primary hover:underline">
        football-data.org
      </a>
    </footer>
  )
}
