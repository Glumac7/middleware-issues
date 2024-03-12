import { useRouter } from "next/router";

export default function Test2({ title, asd }) {
  console.log(asd.stars);
  const router = useRouter();
  return (
    <>
      {asd.stars}
      <p>bla bla bla 2</p>
      <button
        onClick={() => {
          router.push("/test1");
        }}
      >
        link to 1
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
