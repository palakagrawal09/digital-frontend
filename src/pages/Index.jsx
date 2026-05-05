import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Credibility from '@/components/Credibility';
import About from '@/components/About';
import Capabilities from '@/components/Capabilities';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { apiClient } from '@/lib/api';

const buildContentMap = (items = []) => {
  return items.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = {};
    acc[item.section][item.content_key] = item.content_value;
    return acc;
  }, {});
};

const Index = () => {
  const [homepageContent, setHomepageContent] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadHomepageContent = async () => {
      try {
        const res = await apiClient.getPageContent('homepage');
        if (isMounted) {
          setHomepageContent(buildContentMap(Array.isArray(res.data) ? res.data : []));
        }
      } catch (error) {
        console.error('Failed to load homepage content:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHomepageContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const content = useMemo(() => homepageContent, [homepageContent]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={loading ? 'opacity-95 transition-opacity' : 'opacity-100 transition-opacity'}>
        <Hero content={content.hero} />
        <Credibility content={content.credibility} />
        <About content={content.about} />
        <Capabilities content={content.capabilities} />
        <Contact content={content.contact} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
