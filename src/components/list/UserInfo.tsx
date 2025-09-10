import useUserStore from "../context/context";

const UserInfo = () => {
  //@ts-expect-error zustand
  const { currentUser } = useUserStore();
  return (
    <div className="p-4 flex  items-center justify-between ">
      <div className="flex  items-center gap-1 ">
        <img
          className="w-[50px] h-[50px] max-md:w-[35px] max-md:h-[35px] rounded-full object-cover"
          src={currentUser.avatar}
          alt="avatar Image"
        />
        <h2 className="text-2xl max-md:text-xl font-bold">
          {currentUser.username || "./avatar.png"}
        </h2>
      </div>
      <div className="flex gap-4 max-md:gap-2 self-start">
        <img
          className="w-5 max-md:w-4 cursor-pointer"
          src="./more.png"
          alt="more image"
        />
        <img
          className="w-5 max-md:w-4 cursor-pointer"
          src="./video.png"
          alt="video image"
        />
        <img
          className="w-5 max-md:w-4 cursor-pointer"
          src="./edit.png"
          alt="edit image"
        />
      </div>
    </div>
  );
};

export default UserInfo;
