import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Search } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  const raw = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;
  if (!raw || typeof raw !== "string" || !raw.trim()) return null;
  const v = raw.trim();
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("/assets") || v.startsWith("/images")) return v;
  return `${API_BASE_URL}${v.startsWith("/") ? v : `/${v}`}`;
};

const formatDate = (dateValue) => {
  if (!dateValue) return "No date available";
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return "No date available";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const getYear = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return "";
  return date.getFullYear();
};

const News = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/news`)
      .then((r) => r.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : data.data || [];
        setNewsItems(all.filter((item) => item?.published));
      })
      .catch(() => setNewsItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredNews = useMemo(() =>
    newsItems.filter((item) =>
      `${item?.title || ""} ${item?.content || ""}`.toLowerCase().includes(searchTerm.toLowerCase())
    ), [newsItems, searchTerm]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* HERO */}
        <section className="pt-32 pb-20 bg-[#f5f4ef]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-4 sm:gap-5 mb-6">
              <span className="w-12 sm:w-16 h-px bg-[#c59b37]" />
              <span className="text-[#c59b37] font-semibold text-sm sm:text-base uppercase tracking-[0.35em]">Company News</span>
              <span className="w-12 sm:w-16 h-px bg-[#c59b37]" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-[#13233c] mb-6">News & Updates</h1>
            <p className="text-xl sm:text-2xl leading-9 text-[#5e6978] max-w-3xl mx-auto">
              Explore the latest updates, announcements, milestones, and company developments from Digital Integrator Private Limited.
            </p>
          </div>
        </section>

        {/* SEARCH */}
        <section className="py-10 border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search news by title or content..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-black/10 rounded-lg pl-11 pr-4 py-3 bg-white outline-none focus:ring-2 focus:ring-defence-green/20" />
            </div>
          </div>
        </section>

        {/* NEWS LIST */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            {loading ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">Loading news...</p>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-black/10 rounded-xl">
                <h3 className="text-2xl font-semibold mb-3">No news found</h3>
                <p className="text-muted-foreground">No published news is available right now.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {filteredNews.map((item, index) => {
                  const imageUrl = getImageUrl(item?.image_url);
                  return (
                    <article key={item?.id || index}
                      className="bg-white border border-black/5 rounded-xl overflow-hidden shadow-sm">
                      {/* Grid: 2-col if image, 1-col if no image */}
                      <div className={imageUrl ? "grid lg:grid-cols-2 gap-0 items-stretch" : ""}>

                        {/* IMAGE — only render if exists */}
                        {imageUrl && (
                          <div className="bg-slate-100 min-h-[280px]">
                            <img src={imageUrl} alt={item?.title || "News image"}
                              className="w-full h-full object-cover min-h-[280px]"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                // Hide image and collapse to single column
                                e.currentTarget.closest(".bg-slate-100").style.display = "none";
                              }} />
                          </div>
                        )}

                        {/* CONTENT */}
                        <div className="p-8">
                          <div className="inline-flex items-center gap-2 border border-defence-green/20 px-3 py-2 text-sm text-defence-green mb-4 bg-sand-dark/30">
                            <Calendar className="w-4 h-4" />
                            <span>{getYear(item?.published_at) || formatDate(item?.created_at)}</span>
                          </div>
                          <h2 className="text-3xl font-bold mb-4">{item?.title || "Untitled News"}</h2>
                          <p className="text-muted-foreground leading-8 mb-5">{item?.content || "No content available."}</p>
                          <div className="text-sm text-muted-foreground">
                            Published on {formatDate(item?.published_at || item?.created_at)}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default News;