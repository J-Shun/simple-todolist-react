const { useState, useEffect, useRef } = React;

const root = ReactDOM.createRoot(document.querySelector("#root"));
const url = "https://fathomless-brushlands-42339.herokuapp.com/todo3/";

const Banner = () => {
  return (
    <div className="banner px-5 py-8">
      <p className="text-5xl text-white mb-3">Your</p>
      <p className="text-3xl text-white">Todo Memo</p>
    </div>
  );
};

const List = () => {
  const [originalList, setOriginalList] = useState([]);
  const [targetList, setTargetList] = useState([]);
  const [category, setCategory] = useState("全部");

  const fetchList = async () => {
    try {
      const rawData = await fetch(url);
      const listData = await rawData.json();
      setOriginalList(listData);
      setTargetList(listData.slice());
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="px-5">
      <Category
        category={category}
        setCategory={setCategory}
        originalList={originalList}
        setTargetList={setTargetList}
      />
      <p className="my-3 text-md">Tasks</p>
      <ul className="h-64 overflow-auto">
        {targetList.length < 1 && <Empty />}
        {targetList.map((target) => {
          return (
            <Task
              key={target.id}
              target={target}
              targetList={targetList}
              setTargetList={setTargetList}
              originalList={originalList}
              setOriginalList={setOriginalList}
              category={category}
            />
          );
        })}
      </ul>
      <Add
        originalList={originalList}
        setOriginalList={setOriginalList}
        targetList={targetList}
        setTargetList={setTargetList}
        category={category}
      />
    </div>
  );
};

const Category = ({ category, setCategory, originalList, setTargetList }) => {
  const changeCategory = (e) => {
    const position = e.target.textContent;
    setCategory(position);
    const copyList = originalList.slice();
    if (position === "全部") {
      setTargetList(copyList);
    } else if (position === "重要") {
      const markedList = copyList.filter((data) => data.mark === true);
      setTargetList(markedList);
    } else if (position === "未完") {
      const uncheckedList = copyList.filter((data) => data.checked !== true);
      setTargetList(uncheckedList);
    }
  };
  return (
    <ul className="flex justify-center gap-5 py-2">
      <li
        className={`text-xl py-3 px-5 cursor-pointer hover:underline underline-offset-8 ${
          category === "全部" && "text-blue-500"
        }`}
        onClick={changeCategory}
      >
        全部
      </li>
      <li
        className={`text-xl py-3 px-5 cursor-pointer hover:underline underline-offset-8 ${
          category === "重要" && "text-blue-500"
        }`}
        onClick={changeCategory}
      >
        重要
      </li>
      <li
        className={`text-xl py-3 px-5 cursor-pointer hover:underline underline-offset-8 ${
          category === "未完" && "text-blue-500"
        }`}
        onClick={changeCategory}
      >
        未完
      </li>
    </ul>
  );
};

const Empty = () => {
  return (
    <li className="flex h-full justify-center items-center text-3xl text-gray-400 pointer-events-none">
      No Task Now
    </li>
  );
};

const Task = ({
  target,
  setTargetList,
  originalList,
  setOriginalList,
  targetList,
  category,
}) => {
  const { content, id } = target;
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState({ content: content });
  const input = useRef(null);

  const check = async () => {
    const todo = { ...target, checked: !target.checked };
    const rawData = await fetch(url + id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
    });
    const checkData = await rawData.json();
    setOriginalList((prevList) => {
      prevList.splice(prevList.indexOf(target), 1, checkData);
      return [...prevList];
    });
    if (category === "未完" && todo.checked === true) {
      setTargetList((prevList) => {
        prevList.splice(prevList.indexOf(target), 1);
        return [...prevList];
      });
    } else {
      setTargetList((prevList) => {
        prevList.splice(prevList.indexOf(target), 1, checkData);
        return [...prevList];
      });
    }
  };

  const deleteTask = async () => {
    const deleteData = await fetch(url + id, { method: "DELETE" });
    setOriginalList((prevList) => {
      prevList.splice(prevList.indexOf(target), 1);
      return [...prevList];
    });
    setTargetList((prevList) => {
      prevList.splice(prevList.indexOf(target), 1);
      return [...prevList];
    });
  };

  const mark = async () => {
    const todo = { ...target, mark: !target.mark };
    const rawData = await fetch(url + id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
    });
    const markData = await rawData.json();
    setOriginalList((prevList) => {
      prevList.splice(prevList.indexOf(target), 1, markData);
      return [...prevList];
    });
    if (category === "重要" && todo.mark === false) {
      setTargetList((prevList) => {
        prevList.splice(prevList.indexOf(target), 1);
        return [...prevList];
      });
    } else {
      setTargetList((prevList) => {
        prevList.splice(prevList.indexOf(target), 1, markData);
        return [...prevList];
      });
    }
  };

  const addEdit = async () => {
    await setIsEditing(true);
    input.current.focus();
  };

  const editContent = (e) => {
    setNewContent({ content: e.target.value });
  };

  const didEdit = async (e) => {
    if (newContent.content.length < 1) {
      alert("修改失敗，請填入內容");
      input.current.focus();
      return;
    }
    const todo = { ...target, content: newContent.content };
    const rawData = await fetch(url + id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
    });
    const contentData = await rawData.json();
    setOriginalList((prevList) => {
      prevList.splice(prevList.indexOf(target), 1, contentData);
      return [...prevList];
    });
    setTargetList((prevList) => {
      prevList.splice(prevList.indexOf(target), 1, contentData);
      return [...prevList];
    });
    setIsEditing(false);
  };

  return (
    <li className="flex items-center justify-between text-xl py-3 border-b-2">
      {isEditing ? (
        <input
          type="text"
          value={newContent.content}
          onChange={editContent}
          ref={input}
          onKeyUp={(e) => {
            if (e.keyCode === 13) {
              didEdit();
            }
          }}
        ></input>
      ) : (
        <p
          className={`flex-1 cursor-pointer ${
            target.checked &&
            "line-through decoration-red-500 decoration-2 text-gray-400"
          }`}
          onClick={check}
        >
          {content}
        </p>
      )}
      <div className="flex gap-5">
        <i
          className="fa-solid fa-trash cursor-pointer"
          onClick={deleteTask}
        ></i>
        <i
          className={`fa-solid fa-star cursor-pointer hover:text-yellow-500 ${
            target.mark && "text-yellow-500"
          }`}
          onClick={mark}
        ></i>
        {isEditing ? (
          <i
            className="fa-solid fa-circle-check cursor-pointer"
            onClick={didEdit}
          ></i>
        ) : (
          <i
            className="fa-solid fa-pen-to-square cursor-pointer"
            onClick={addEdit}
          ></i>
        )}
      </div>
    </li>
  );
};

const Add = ({
  originalList,
  setOriginalList,
  targetList,
  setTargetList,
  category,
}) => {
  const [todo, setTodo] = useState({ content: "" });
  const handleClick = async () => {
    try {
      if (todo.content.length < 1) return;
      const postData = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
      });
      const response = await postData.json();
      setOriginalList([...originalList, response]);
      if (category !== "重要") {
        setTargetList([...targetList, response]);
      }
      setTodo({ content: "" });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="my-6 flex flex-col items-center gap-5">
      <input
        type="text"
        className="border border-stone-200 rounded-lg py-1 text-center"
        placeholder="Write Down Your Task Here"
        onChange={(e) => {
          setTodo({ content: e.target.value });
        }}
        onKeyUp={(e) => {
          if (e.keyCode === 13) {
            handleClick();
          }
        }}
        value={todo.content}
      />
      <i
        className="fa-solid fa-circle-plus text-blue-700 text-4xl rounded-full cursor-pointer hover:text-blue-800"
        onClick={handleClick}
      ></i>
    </div>
  );
};

root.render(
  <div className="max-w-lg mx-auto bg-white rounded-lg overflow-hidden drop-shadow-lg mt-8">
    <Banner />
    <List />
  </div>
);
