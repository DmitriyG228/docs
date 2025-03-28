export default function PrivacyPage() {
  return (
    <div className="py-10">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Introduction</h2>
          <p>
            At Vexa.ai Inc. ("Vexa.ai", "we", "us", or "our"), we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our meeting intelligence API services and business meeting assistant solutions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Information We Collect</h2>
          <div className="space-y-2">
            <h3 className="text-xl font-medium">Personal Information</h3>
            <p>We may collect personal information that you provide to us, including but not limited to:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Name and email address</li>
              <li>Company information</li>
              <li>Billing information</li>
              <li>API keys and authentication tokens</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-medium">Meeting Data</h3>
            <p>When using our services, we may collect:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Meeting audio and transcripts</li>
              <li>Meeting metadata (time, duration, participants)</li>
              <li>Chat messages and shared content</li>
              <li>Usage statistics and analytics</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
          <p>We use the collected information for various purposes:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>To provide and maintain our services</li>
            <li>To process your transactions</li>
            <li>To improve our services</li>
            <li>To send you technical notices and updates</li>
            <li>To respond to your comments and support requests</li>
            <li>To detect and prevent fraudulent activities</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your data. These measures include:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
            <li>Secure data centers and infrastructure</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Retention</h2>
          <p>
            We retain your personal information and meeting data for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium">Company Information</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Legal Name: Vexa.ai Inc.</li>
                <li>Address: 16192 Coastal Highway, Lewes, DE 19958</li>
                <li>Email: info@vexa.ai</li>
              </ul>
            </div>

          </div>
        </section>
      </div>
    </div>
  )
} 