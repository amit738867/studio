export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Pramaan. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}