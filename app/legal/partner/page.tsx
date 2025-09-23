export const metadata = {
  title: "Partner With Us - LeakyBabes",
  description: "Join our network of partners and content creators",
}

export default function PartnerPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Partner With Us</h1>
      <p className="text-gray-300 mb-8">
        Join our growing network of partners and content creators. We're always looking for quality partnerships that benefit both parties.
      </p>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Partnership Opportunities</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Content sharing and cross-promotion</h3>
              <p className="text-gray-300">Cross-promotion and content sharing opportunities with quality partners</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Revenue sharing programs</h3>
              <p className="text-gray-300">Profitable revenue sharing programs for qualified partners</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Technical integrations and APIs</h3>
              <p className="text-gray-300">APIs and technical integrations for seamless collaboration</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Marketing and promotional partnerships</h3>
              <p className="text-gray-300">Joint marketing and promotional opportunities</p>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Contact Us</h2>
          <p className="text-gray-300 mb-4">
            For partnership inquiries and collaboration opportunities, please reach out to us:
          </p>
          <p className="text-gray-300">
            <a 
              href="https://t.me/leakybabes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 transition-colors"
            >
              Contact us on Telegram
            </a>
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Ready to Partner?</h2>
          <p className="text-gray-300">
            We're excited to explore partnership opportunities with like-minded businesses and content creators. Get in touch to discuss how we can work together.
          </p>
        </section>
      </div>
      
      <div className="mt-10 pt-6 border-t border-gray-800">
        <p className="text-sm text-gray-400">
          For partnership inquiries, contact us on Telegram at <a href="https://t.me/leakybabes" className="text-pink-400 hover:text-pink-300">@leakybabes</a>
        </p>
      </div>
    </div>
  )
}