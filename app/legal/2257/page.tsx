export const metadata = {
  title: "18 USC 2257 Compliance - LeakyBabes",
  description: "Age verification and record keeping compliance information",
}

export default function Compliance2257Page() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">18 USC 2257 Compliance</h1>
      <p className="text-gray-300 mb-8">Age Verification & Record Keeping</p>
      
      <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-yellow-300 mb-2">Important Legal Notice</h3>
        <p className="text-yellow-200 text-sm leading-relaxed">
          LeakyBabes.com is not a producer (primary or secondary) of any and all of the content found on the website (LeakyBabes.com). With respect to the records as per 18 USC 2257 for any and all content found on this site, please kindly direct your request to the site for which the content was produced.
        </p>
      </div>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Content Hosting & Production</h2>
          <p className="text-gray-300">
            LeakyBabes.com is a video sharing site which allows for the uploading, sharing and general viewing of various types of adult content and while LeakyBabes.com does the best it can with verifying compliance, it may not be 100% accurate.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Compliance Procedures</h2>
          <p className="text-gray-300 mb-4">
            LeakyBabes.com abides by the following procedures to ensure compliance:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-300">
            <li>Requiring all users to be 18 years of age to upload videos.</li>
            <li>When uploading, user must verify the content; assure he/she is 18 years of age; certify that he/she keeps records of the models in the content and that they are over 18 years of age.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Content Flagging & Removal</h2>
          <p className="text-gray-300">
            LeakyBabes.com allows content to be flagged as inappropriate. Should any content be flagged as illegal, unlawful, harassing, harmful, offensive or various other reasons, LeakyBabes.com shall remove it from the site without delay.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Contact & Assistance</h2>
          <p className="text-gray-300 mb-4">
            For further assistance and/or information in finding the content's originating site, please contact LeakyBabes.com compliance at:
          </p>
          <p className="text-gray-300">
            <a 
              href="mailto:leakybabes@proton.me" 
              className="text-pink-400 hover:text-pink-300 transition-colors"
            >
              leakybabes@proton.me
            </a>
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Compliance Statement</h2>
          <p className="text-gray-300 mb-4">
            LeakyBabes.com is committed to compliance with 18 USC 2257 and works diligently to ensure all content meets legal requirements. All models appearing on this website are 18 years or older.
          </p>
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 inline-block">
            <p className="text-green-300 font-semibold text-sm">
              ✓ Age Verification Compliant
            </p>
          </div>
        </section>
      </div>
      
      <div className="mt-10 pt-6 border-t border-gray-800">
        <p className="text-sm text-gray-400">
          For compliance inquiries, contact us at <a href="mailto:leakybabes@proton.me" className="text-pink-400 hover:text-pink-300">leakybabes@proton.me</a>
        </p>
      </div>
    </div>
  )
}