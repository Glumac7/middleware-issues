import { useRouter } from "next/router";

export default function Test2({ title, asd }) {
  console.log(asd.stars);
  const router = useRouter();
  return (
    <>
      <p>Second Page</p>
      <button
        className="mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          router.push("/test1");
        }}
      >
        go to first page
      </button>
    </>
  );
}

export const getServerSideProps = async () => {
  return {
    props: {
      title: "Test 2",
    },
  };
};
