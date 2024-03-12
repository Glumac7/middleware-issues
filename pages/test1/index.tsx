import { useRouter } from "next/router";

export default function Test({ stars }) {
  console.log(stars);
  const router = useRouter();

  return (
    <>
      <p>First Page</p>
      <button
        className="mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          router.push("/test2/234");
        }}
      >
        go to second page
      </button>
    </>
  );
}

export const getServerSideProps = async () => {
  return { props: { stars: 5 } };
};
