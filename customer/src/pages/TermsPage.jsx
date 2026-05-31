import React, { useEffect } from "react";

const TermsPage = () => {
  // Scroll to top when the page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex-1 bg-[#ececec] pb-24 pt-4 sm:pt-8 font-['Nunito',_sans-serif]">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6">
        
        {/* Header Section */}
        <section className="bg-[var(--mk-navy)] rounded-t-3xl px-6 py-10 sm:px-12 sm:py-16 text-center shadow-md">
          <h1 className="text-3xl sm:text-5xl font-['Bebas_Neue',_sans-serif] tracking-[0.12em] text-white">
            TERMS & CONDITIONS
          </h1>
          <p className="mt-2 text-xs sm:text-sm font-bold tracking-[0.1em] text-[var(--mk-yellow)] uppercase">
            Miniput & Kwink • B2B Wholesale Only
          </p>
        </section>

        {/* Content Section */}
        <section className="bg-white rounded-b-3xl p-6 sm:p-12 shadow-md space-y-8 text-gray-700">
          
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide mb-3">1. Introduction</h2>
            <p className="text-sm leading-relaxed">
              Welcome to the official B2B wholesale platform for <strong>MINIPUT</strong> and <strong>KWINK</strong>. 
              By accessing our website and placing an order, you agree to be bound by these Terms and Conditions. 
              These terms are tailored specifically for business-to-business (B2B) transactions. 
              We do not entertain direct-to-consumer (B2C) retail orders on this platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide mb-3">2. Wholesale Eligibility</h2>
            <ul className="list-disc pl-5 text-sm space-y-2 leading-relaxed">
              <li>Purchases on this platform are strictly for retail shop owners, distributors, and authorized resellers.</li>
              <li>A valid GSTIN (Goods and Services Tax Identification Number) may be required to process your bulk orders.</li>
              <li>We reserve the right to cancel any orders that appear to be for personal retail consumption rather than wholesale.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide mb-3">3. Orders & Pricing</h2>
            <ul className="list-disc pl-5 text-sm space-y-2 leading-relaxed">
              <li>All prices displayed are wholesale prices. GST and transportation costs are calculated extra as applicable.</li>
              <li>Products are sold in predefined sets/ratios (e.g., full size sets). Breaking of sets is not permitted.</li>
              <li>Order confirmation is subject to stock availability. In case an item is out of stock after order placement, our team will contact you for an alternative or adjustment.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide mb-3">4. Shipping & Transport</h2>
            <p className="text-sm leading-relaxed mb-2">
              We dispatch goods via your preferred transport or courier partner.
            </p>
            <ul className="list-disc pl-5 text-sm space-y-2 leading-relaxed">
              <li>The buyer bears all transportation and freight charges.</li>
              <li>Once the goods are handed over to the transport/courier service and the LR (Lorry Receipt) is shared, MINIPUT & KWINK hold no liability for delays, transit damage, or loss.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide mb-3">5. Returns & Exchanges</h2>
            <p className="text-sm leading-relaxed mb-2">
              Due to the nature of wholesale business, we maintain a strict return policy:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-2 leading-relaxed">
              <li>Goods once sold will not be taken back or exchanged based on unsellability or preference.</li>
              <li>Returns are only accepted in case of severe manufacturing defects.</li>
              <li>Claims for defective pieces must be reported to your assigned sales agent or our WhatsApp support within <strong>48 hours</strong> of receiving the delivery, accompanied by an unpacking video and clear images.</li>
              <li>Defective pieces must be returned in their original packaging with tags intact.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide mb-3">6. Modifications</h2>
            <p className="text-sm leading-relaxed">
              MINIPUT and KWINK reserve the right to modify these Terms and Conditions at any time. Any changes will be effective immediately upon posting to this website. Your continued use of the website constitutes your agreement to the modified terms.
            </p>
          </div>

        </section>
      </div>
    </div>
  );
};

export default TermsPage;