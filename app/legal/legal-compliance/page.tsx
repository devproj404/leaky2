export const metadata = {
  title: "Legal Compliance",
  description: "Our commitment to following regulations",
}

export default function LegalCompliance() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Legal Compliance</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Regulatory Compliance</h2>
          <p className="text-gray-300">
            {/* Your regulatory compliance text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Age Verification</h2>
          <p className="text-gray-300">
            {/* Your age verification text here */}
          </p>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mt-4">
            <h4 className="font-medium mb-2">Age Requirements:</h4>
            <p className="text-gray-300">
              {/* Your age requirements text here */}
            </p>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Content Verification</h2>
          <p className="text-gray-300">
            {/* Your content verification text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Payment Processing Compliance</h2>
          <p className="text-gray-300">
            {/* Your payment processing compliance text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Data Protection and Privacy</h2>
          <p className="text-gray-300">
            {/* Your data protection and privacy text here */}
          </p>
          
          <h3 className="text-xl font-semibold mt-4 mb-2">GDPR Compliance</h3>
          <p className="text-gray-300">
            {/* Your GDPR compliance text here */}
          </p>
          
          <h3 className="text-xl font-semibold mt-4 mb-2">CCPA Compliance</h3>
          <p className="text-gray-300">
            {/* Your CCPA compliance text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Accessibility</h2>
          <p className="text-gray-300">
            {/* Your accessibility compliance text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">7. International Compliance</h2>
          <p className="text-gray-300">
            {/* Your international compliance text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Reporting Non-Compliance</h2>
          <p className="text-gray-300">
            {/* Your reporting non-compliance text here */}
          </p>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mt-4">
            <h4 className="font-medium mb-2">Contact for Compliance Issues:</h4>
            <address className="text-gray-300 not-italic">
              {/* Your compliance contact details here */}
            </address>
          </div>
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