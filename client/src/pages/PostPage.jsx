import { Button, Footer, Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CallToAction from "../components/CallToAction";
import CommentSection from "../components/CommentSection";
import PostCard from "../components/PostCard";
import Chatbot from "../components/Chatbot";  


export default function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const fullText = "I am a Full Stack Web Developer";
  const typingSpeed = 150;
  const resetDelay = 2500;

  useEffect(() => {
    let index = 0;
    const type = () => {
      if (index <= fullText.length) {
        setText(fullText.slice(0, index));
        index++;
        setTimeout(type, typingSpeed);
      } else {
        setTimeout(() => {
          index = 0;
          setText("");
          type();
        }, resetDelay);
      }
    };
    type();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch("/api/post/getPosts");
      const data = await res.json();
      setPosts(data.posts);
    };
    fetchPosts();
  }, []);

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/post/getposts?slug=${postSlug}`);
        const data = await res.json();
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        if (res.ok) {
          setPost(data.posts[0]);
          setLoading(false);
          setError(false);
        }
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug]);

  useEffect(() => {
    try {
      const fetchRecentPosts = async () => {
        const res = await fetch(`/api/post/getposts?limit=3`);
        const data = await res.json();
        if (res.ok) {
          setRecentPosts(data.posts);
        }
      };
      fetchRecentPosts();
    } catch (error) {
      console.log(error.message);
    }
  }, []);
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  return (
    <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
      {isChatbotOpen && <Chatbot onClose={() => setIsChatbotOpen(false)} />}
      <h1 className="text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl">
        {post && post.title}
      </h1>
      <Link
        to={`/search?category=${post && post.category}`}
        className="self-center mt-5"
      >
        <Button color="gray" pill size="xs">
          {post && post.category}
        </Button>
      </Link>
      <img
        src={post && post.image}
        alt={post && post.title}
        className="mt-10 p-3 max-h-[600px] w-full object-cover"
      />
      <div className="flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs">
        <span>{post && new Date(post.createdAt).toLocaleDateString()}</span>
        <span className="italic">
          {post && (post.content.length / 1000).toFixed(0)} mins read
        </span>
      </div>
      <div
        className="p-3 max-w-2xl mx-auto w-full post-content"
        dangerouslySetInnerHTML={{ __html: post && post.content }}
      ></div>
      <div className="max-w-4xl mx-auto w-full ">
        <CallToAction />
      </div>
      <CommentSection postId={post._id} />
      <Footer.Divider />

      <div className="flex flex-col justify-center items-center mb-5">
        <h1 className="text-xl mt-2 underline text-yellow-500 font-bold">
          Recent articles
        </h1>

        <div className="flex flex-wrap gap-5 mt-5 justify-center">
          {recentPosts &&
            recentPosts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      </div>
      {/* Floating Buttons Section */}
      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3">
         {/* Chatbot Button */}
         <button
          className="bg-blue-500 text-white p-3 shadow-lg hover:bg-blue-600 font-bold py-2 px-4 rounded scroll-button"
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        >
          <i className="fa-solid fa-headset text-2xl"></i>
        </button>

        {/* Scroll-to-Top Button */}
        {isVisible && (
          <button
            onClick={scrollToTop}
            className="bg-gradient-to-r from-yellow-500 to-pink-500 text-white font-bold py-2 px-4 rounded scroll-button"
          >
            <i className="fa-solid fa-up-long"></i>
          </button>
        )}
      </div>
    </main>
  );
}
