import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const navigate = useNavigate();

  // fetch autocomplete suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/v1/course/search/suggestions?q=${query}`
        );
        const data = await res.json();
        setSuggestions(data.courses || []);
      } catch (err) {
        console.error("Search suggestion error:", err);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelectCourse = (courseId) => {
    setShowSuggest(false);
    navigate(`/course-detail/${courseId}`);
  };

  return (
    <section className="relative w-screen h-[80vh] flex flex-col justify-center items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-center">
      <div className="w-full max-w-2xl mx-auto px-4">
        <h1 className="text-white text-4xl md:text-5xl font-extrabold mb-4">
          Find the Best Courses for You
        </h1>

        <p className="text-indigo-100 mb-8">
          Discover, Learn, and Upskill with our wide range of courses
        </p>

        {/* SEARCH BAR */}
        <div className="relative w-72 sm:w-96 mx-auto">
          <input
            type="text"
            value={query}
            placeholder="Search courses..."
            onChange={(e) => {
              const value = e.target.value;
              setQuery(e.target.value);
              setShowSuggest(true);

               // xóa hết text → nhả search
                if (value.trim() === "") {
                  navigate("/", { replace: true });
                }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                navigate(`/?q=${encodeURIComponent(query)}`);
                setShowSuggest(false);
              }
            }}
                className="
                    px-5 py-3 w-full rounded-full
                    bg-white text-gray-800
                    border border-indigo-200
                    shadow-md
                    placeholder-gray-400
                    focus:outline-none
                    focus:ring-2 focus:ring-indigo-400
                    focus:border-indigo-400
                  "

          />

          {/* AUTOCOMPLETE */}
          {showSuggest && suggestions.length > 0 && (
           <div
              className="
                absolute z-20 mt-2 w-full
                bg-white/95 backdrop-blur
                rounded-2xl
                shadow-2xl
                border border-indigo-100
                overflow-hidden
              "
            >

              {suggestions.map((c) => (
              <div
                  key={c._id}
                  onMouseDown={() => handleSelectCourse(c._id)}
                  className="
                    px-5 py-3 cursor-pointer
                    flex justify-between items-center
                    transition
                  
                    hover:from-indigo-50 hover:to-purple-50
                  "
                >

                  <span className="text-gray-800 font-semibold">{c.courseTitle}</span>
                  <span className="text-purple-600 text-sm">
                    {c.coursePrice.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EXPLORE */}
        <div className="mt-6">
          <button
            onClick={() => {
              if (query.trim()) {
                navigate(`/?q=${encodeURIComponent(query)}`);
                setShowSuggest(false);
              }
            }}
            className="bg-white text-blue-700 font-semibold px-6 py-2 rounded-full"
          >
            Explore Courses
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
