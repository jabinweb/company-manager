import Link from "next/link"

export function LandingFooter() {
  return (
    <footer className="bg-white">
      <div className="container mx-auto px-4 py-12">
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-gray-600 hover:text-blue-600">Features</Link></li>
              <li><Link href="#pricing" className="text-gray-600 hover:text-blue-600">Pricing</Link></li>
              <li><Link href="#contact" className="text-gray-600 hover:text-blue-600">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-600 hover:text-blue-600">About</Link></li>
              <li><Link href="/blog" className="text-gray-600 hover:text-blue-600">Blog</Link></li>
              <li><Link href="/careers" className="text-gray-600 hover:text-blue-600">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-600 hover:text-blue-600">Privacy</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-blue-600">Terms</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-600 hover:text-blue-600">Twitter</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-blue-600">LinkedIn</Link></li>
              <li><Link href="#" className="text-gray-600 hover:text-blue-600">GitHub</Link></li>
            </ul>
          </div>
        </div> */}
        <div className="mt-12 pt-8 border-t text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Jabin International. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
