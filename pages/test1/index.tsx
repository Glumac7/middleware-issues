import router, { useRouter } from "next/router";

export default function Test({ stars }) {
  console.log(stars);
  const router = useRouter();

  return (
    <>
      <p>bla bla bla {stars}</p>
      <button
        onClick={() => {
          router.push("/test2/234");
        }}
      >
        link to 2
      </button>
    </>
  );
}

export const getServerSideProps = async () => {
  return { props: { stars: 5 } };
};
