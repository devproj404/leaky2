export const metadata = {
  title: "Privacy Policy",
  description: "How we handle and protect your data",
}

export default function PrivacyPolicy() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="text-gray-300">
            {/* Your information collection text here */}
          </p>
          
          <h3 className="text-xl font-semibold mt-4 mb-2">Personal Information</h3>
          <p className="text-gray-300">
            {/* Your personal information collection text here */}
          </p>
          
          <h3 className="text-xl font-semibold mt-4 mb-2">Usage Data</h3>
          <p className="text-gray-300">
            {/* Your usage data collection text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-300">
            {/* Your information usage text here */}
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-300">
            {/* Your list items here */}
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Information Sharing and Disclosure</h2>
          <p className="text-gray-300">
            {/* Your information sharing text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p className="text-gray-300">
            {/* Your data security text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Your Data Protection Rights</h2>
          <p className="text-gray-300">
            {/* Your data protection rights text here */}
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-300">
            {/* Your list items here */}
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking Technologies</h2>
          <p className="text-gray-300">
            {/* Your cookies policy text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Third-Party Services</h2>
          <p className="text-gray-300">
            {/* Your third-party services text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
          <p className="text-gray-300">
            {/* Your children's privacy text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Changes to This Privacy Policy</h2>
          <p className="text-gray-300">
            {/* Your changes to privacy policy text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
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