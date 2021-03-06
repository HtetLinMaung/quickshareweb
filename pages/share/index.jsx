import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { pickFile } from "@jst_htet/file-picker";

export default function Share() {
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [myname, setMyName] = useState("");

  useEffect(() => {
    const s = io("http://150.95.82.125:4000");
    // const s = io("http://localhost:4001");
    setSocket(s);
    s.on("connect", () => {
      s.on("init", (payload) => {
        console.log(payload);
        setMyName(payload.shortname);
      });
      s.on("users", (payload) => {
        setUsers(payload);
      });
      s.on("file:recieve", (payload) => {
        console.log("recived");
        const blob = new Blob([payload.buffer]);
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = payload.filename;
        a.click();
      });
    });
  }, []);

  const handleClick = async (id) => {
    const [err, f] = await pickFile();
    console.log(f);
    if (!err) {
      const fr = new FileReader();
      fr.readAsArrayBuffer(f.file);
      fr.addEventListener("load", () => {
        console.log("emit");
        socket.emit("file:transfer", id, fr.result, f.file.name);
      });
    }
  };
  return (
    <div className="h-screen flex items-center justify-center">
      <h1 className=" fixed top-2 right-2">You are {myname}</h1>
      {users.length ? (
        users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-center flex-col mx-5"
          >
            <div
              onClick={() => handleClick(user.id)}
              className="rounded-full  p-2 bg-sky-400 "
            >
              <svg
                style={{ color: "white" }}
                aria-hidden="true"
                focusable="false"
                data-prefix="far"
                data-icon="desktop"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
                className="svg-inline--fa fa-desktop fa-w-18 fa-3x  w-6"
              >
                <path
                  fill="currentColor"
                  d="M528 0H48C21.5 0 0 21.5 0 48v288c0 26.5 21.5 48 48 48h480c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zm-6 336H54c-3.3 0-6-2.7-6-6V54c0-3.3 2.7-6 6-6h468c3.3 0 6 2.7 6 6v276c0 3.3-2.7 6-6 6zm-42 152c0 13.3-10.7 24-24 24H120c-13.3 0-24-10.7-24-24s10.7-24 24-24h98.7l18.6-55.8c1.6-4.9 6.2-8.2 11.4-8.2h78.7c5.2 0 9.8 3.3 11.4 8.2l18.6 55.8H456c13.3 0 24 10.7 24 24z"
                  className=""
                ></path>
              </svg>
            </div>
            <span style={{ fontSize: 12 }}>{user.shortname}</span>
          </div>
        ))
      ) : (
        <h1>Open Quickshare on other devices to send files</h1>
      )}
    </div>
  );
}
