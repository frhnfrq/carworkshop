import { type NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";

const Home: NextPage = () => {
  const { data } = api.mechanic.getAll.useQuery();

  return (
    <>
      <Head>
        <title>CarWorkshop</title>
        <meta name="description" content="Get your cars repaired" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div>
          {data?.map((mechanic) => (
            <div key={mechanic.id}>{mechanic.name}</div>
          ))}
        </div>
      </main>
    </>
  );
};

export default Home;
