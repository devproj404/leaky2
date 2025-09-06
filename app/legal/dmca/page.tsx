export const metadata = {
  title: "DMCA Policy",
  description: "Copyright and content removal procedures",
}

export default function DMCAPolicy() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">DMCA Policy</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-gray-300">
            {/* Your DMCA introduction text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Copyright Infringement Notification</h2>
          <p className="text-gray-300">
            {/* Your copyright infringement notification text here */}
          </p>
          
          <h3 className="text-xl font-semibold mt-4 mb-2">How to Submit a DMCA Notice</h3>
          <p className="text-gray-300">
            {/* Your DMCA notice submission instructions here */}
          </p>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mt-4">
            <h4 className="font-medium mb-2">Required Information for DMCA Notices:</h4>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              {/* Your list items here */}
            </ul>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Counter-Notification Procedure</h2>
          <p className="text-gray-300">
            {/* Your counter-notification procedure text here */}
          </p>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mt-4">
            <h4 className="font-medium mb-2">Required Information for Counter-Notices:</h4>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              {/* Your list items here */}
            </ul>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Repeat Infringer Policy</h2>
          <p className="text-gray-300">
            {/* Your repeat infringer policy text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Disclaimer</h2>
          <p className="text-gray-300">
            {/* Your disclaimer text here */}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Contact Information</h2>
          <p className="text-gray-300">
            {/* Your contact information text here */}
          </p>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mt-4">
            <h4 className="font-medium mb-2">DMCA Agent:</h4>
            <address className="text-gray-300 not-italic">
              {/* Your DMCA agent contact details here */}
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