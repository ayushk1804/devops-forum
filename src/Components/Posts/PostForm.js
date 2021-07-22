import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import ReactMde from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";
import ReactMarkdown from "react-markdown";

const PostForm = ({ defaultValues, onSubmit }) => {
  console.log(typeof {defaultValues})
  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm({defaultValues:{defaultValues}});
  const [selectedTab, setSelectedTab] = useState("write");

  return (
    <div className="flex space-x-3 ">
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
  );
};

export { PostForm };
