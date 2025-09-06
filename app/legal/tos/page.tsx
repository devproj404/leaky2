export const metadata = {
  title: "Terms of Service",
  description: "Rules and guidelines for using the platform",
}

export default function TermsOfService() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-gray-300">
            {/* Your terms of service introduction text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Acceptance of Terms</h2>
          <p className="text-gray-300">
            {/* Your acceptance of terms text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <p className="text-gray-300">
            {/* Your user accounts terms text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Content Guidelines</h2>
          <p className="text-gray-300">
            {/* Your content guidelines text here */}
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-300">
            {/* Your list items here */}
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Premium Services</h2>
          <p className="text-gray-300">
            {/* Your premium services terms text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
          <p className="text-gray-300">
            {/* Your intellectual property terms text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p className="text-gray-300">
            {/* Your limitation of liability text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
          <p className="text-gray-300">
            {/* Your termination terms text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
          <p className="text-gray-300">
            {/* Your changes to terms text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
          <p className="text-gray-300">
            {/* Your contact information text here */}
          </p>
        </section>
      </div>
      
      <div className="mt-10 pt-6 border-t border-gray-800">
        <p className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  )
} 