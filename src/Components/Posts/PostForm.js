import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import ReactMde from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";
import ReactMarkdown from "react-markdown";

const PostForm = ({ onSubmit }) => {
  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm();
  const [selectedTab, setSelectedTab] = useState("write");

  return (
    <div className="flex space-x-3 ">
      <div>
        <span className="inline-block h-8 w-8 rounded-full overflow-hidden bg-gray-200">
          <svg
            className="h-full w-full text-gray-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </span>
      </div>
      <div className="flex-1">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="postMessage"
            placeholder="Reply to thread"
            control={control}
            defaultValue={""}
            rules={{ required: "Leaving an Empty post?" }}
            render={({ field }) => (
              <ReactMde
                {...field}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
                generateMarkdownPreview={(markdown) =>
                  Promise.resolve(<ReactMarkdown children={markdown} />)
                }
              />
            )}
          />
          {errors.postMessage && <span>{errors.postMessage.message}</span>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-500 hover:bg-green-600 p-2 rounded font-semibold text-white focus-within:outline-none"
          >
            Reply
          </button>
        </form>
      </div>
    </div>
  );
};

export { PostForm };
