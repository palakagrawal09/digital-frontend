import { MapPin, Mail, Phone, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollReveal from '@/components/ScrollReveal';

const Contact = () => {
  return (
    <section id="contact" className="py-16 sm:py-20 bg-sand-dark/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="w-12 h-0.5 bg-brass-gold" />
              <span className="text-brass-gold font-semibold text-sm uppercase tracking-widest">Contact Us</span>
              <span className="w-12 h-0.5 bg-brass-gold" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-2 mb-4">
              Get in Touch
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
              Ready to discuss your defence or industrial automation requirements? Reach out to our engineering team for expert consultation.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ScrollReveal delay={0.1}>
            <div className="bg-white border border-gunmetal/15 p-6 text-center">
              <div className="w-12 h-12 bg-defence-green/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-defence-green" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Address</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                46-A, Electronic Complex<br />
                Pardeshipura, Indore<br />
                Madhya Pradesh - 452001
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-white border border-gunmetal/15 p-6 text-center">
              <div className="w-12 h-12 bg-defence-green/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-defence-green" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Email</h3>
              <a href="mailto:diplsales@diplindia.com" className="text-sm text-brass-gold hover:underline">
                diplsales@diplindia.com
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="bg-white border border-gunmetal/15 p-6 text-center">
              <div className="w-12 h-12 bg-defence-green/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-defence-green" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Company Registration</h3>
              <p className="text-sm text-muted-foreground">
                CIN: U31909MP1997PTC012011
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="bg-white border border-gunmetal/15 p-6 text-center">
              <div className="w-12 h-12 bg-defence-green/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-defence-green" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Business Hours</h3>
              <p className="text-sm text-muted-foreground">
                Mon - Sat<br />
                9:00 AM - 6:00 PM
              </p>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <div className="text-center mt-12 bg-defence-green/5 border border-defence-green/20 p-8">
            <h3 className="text-2xl font-semibold text-foreground mb-4">Ready to Partner with Us?</h3>
            <p className="text-muted-foreground mb-6">
              Let's discuss how our defence-grade solutions can meet your mission-critical needs.
            </p>
            <Link to="/enquiry" className="btn-accent inline-flex items-center gap-2">
              Get a Quote
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Contact;