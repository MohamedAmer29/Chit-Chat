import axios from "axios";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";
import { auth, db } from "./lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const Login = () => {
  const [photo, setPhoto] = useState({
    file: null,
    url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cloudinary_url = import.meta.env.VITE_CLOUDINARY;
  const [sign, setSign] = useState("Login");
  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);

    const { username, email, password } = Object.fromEntries(formData);
    if (!username || !password || !email || !photo.file) {
      const err = `Please Provide a ${!username && "username"}, ${
        !email && "email"
      }, ${!password && "password"}, ${!photo.file && "photo"}`.replace(
        /false,/g,
        ""
      );
      toast.error(err);
      setIsSubmitting(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("file", photo.file);
      data.append("upload_preset", "Chit-Chat");

      const response = await axios.post(cloudinary_url, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const authResponse = await createUserWithEmailAndPassword(
        auth,
        //@ts-expect-error aaa
        email,
        password
      );
      await setDoc(doc(db, "users", authResponse.user.uid), {
        username,
        email,
        password,
        id: authResponse.user.uid,
        blocked: [],
        avatar: response.data.url,
      });
      await setDoc(doc(db, "userChats", authResponse.user.uid), {
        chats: [],
      });
      toast.success("Account Created! You can login now!");
      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      //@ts-expect-error aaa
      toast.error(error.message);
      setIsSubmitting(false);
    }
  };
  const handleLogin = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);
    if (!password || !email) {
      const err = `Please Provide a ${!email && "email"}, ${
        !password && "password"
      }`.replace(/false,/g, "");
      toast.error(err);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      // console.log(res);
      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
      //@ts-expect-error aaa
      toast.error(error.message);
    }
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    //@ts-expect-error aaa
    if (e.target.files[0]) {
      setPhoto({
        //@ts-expect-error aaa
        file: e.target.files[0],
        //@ts-expect-error aaa
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };
  return (
    <div className="w-full h-full flex items-center gap-25 ">
      {/* <AdvancedImage cldImg={img} /> */}
      {sign === "Login" ? (
        <div className=" w-full  flex flex-col items-center gap-5 ">
          <h2 className="text-2xl font-bold mb-10 font-serif">Welcome back,</h2>
          <form
            onSubmit={handleLogin}
            className="flex flex-col items-center gap-5 justify-center "
          >
            <input
              className="p-5 border-0 outline-0 bg-[rgba(17,25,48,0.3)] text-white rounded-sm"
              type="text"
              placeholder="Email"
              name="email"
            />
            <input
              className="p-5 border-0 outline-0 bg-[rgba(17,25,48,0.3)] text-white rounded-sm"
              type="password"
              placeholder="Password"
              name="password"
            />
            <p className="text-sm translate-y-2">
              Doesn't have an{" "}
              <span
                onClick={() => setSign("Register")}
                className="text-base text-blue-300 underline cursor-pointer"
              >
                Account
              </span>
            </p>
            <button
              disabled={isSubmitting}
              className="w-55 max-md:w-full p-5 disabled:bg-gray-500 disabled:p-3 disabled:cursor-not-allowed border-0 bg-[#1f8ef1] text-white rounded-sm cursor-pointer"
            >
              {!isSubmitting ? (
                "Sign In"
              ) : (
                <div className="flex gap-4 text-green-400 font-semibold text-lg">
                  <div className="border-white border-solid border-4 box-border border-b-transparent w-7 h-7 animate-spin rounded-full "></div>
                  <span>Submitting</span>
                </div>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col w-full justify-center items-center delay-200 transition-opacity duration-1000">
          <h2 className="text-2xl font-bold mb-10 font-serif">
            Create an Account
          </h2>
          <form
            onSubmit={handleSubmit}
            className="flex  flex-col items-center gap-5 justify-center"
          >
            <label
              htmlFor="file"
              className="cursor-pointer gap-4 flex items-center justify-between  underline"
            >
              <img
                className="w-20 h-20 rounded-md object-cover opacity-60"
                src={photo.url || "./avatar.png"}
                alt="Image"
              />
              Upload an Image
            </label>
            <input
              type="file"
              id="file"
              className="hidden"
              onChange={handleFile}
            />
            <input
              className="p-5 border-0 outline-0 bg-[rgba(17,25,48,0.3)] text-white rounded-sm"
              type="text"
              placeholder="Username"
              name="username"
            />
            <input
              className="p-5 border-0 outline-0 bg-[rgba(17,25,48,0.3)] text-white rounded-sm"
              type="text"
              placeholder="Email"
              name="email"
            />
            <input
              className="p-5 border-0 outline-0 bg-[rgba(17,25,48,0.3)] text-white rounded-sm"
              type="password"
              placeholder="Password"
              name="password"
            />
            <p className="text-sm translate-y-2">
              Already have an{" "}
              <span
                onClick={() => setSign("Login")}
                className="text-base text-blue-300 underline cursor-pointer"
              >
                Account
              </span>
            </p>
            <button
              disabled={isSubmitting}
              className="w-55 max-md:w-full p-5 disabled:bg-gray-500 disabled:p-3 disabled:cursor-not-allowed border-0 bg-[#1f8ef1] text-white rounded-sm cursor-pointer"
            >
              {!isSubmitting ? (
                "Sign Up"
              ) : (
                <div className="flex gap-4 text-green-400 font-semibold text-lg">
                  <div className="border-white border-solid border-4 box-border border-b-transparent w-7 h-7 animate-spin rounded-full "></div>
                  <span>Submitting</span>
                </div>
              )}
            </button>
          </form>
        </div>
      )}
      {/* <div className="h-[80%]  w-[2px] bg-[#ddddd3]"></div> */}

      {/* <div></div> */}
    </div>
  );
};

export default Login;
