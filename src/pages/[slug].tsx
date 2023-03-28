import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import superjson from "superjson";
import { prisma } from "~/server/db";
import { api } from "~/utils/api";

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>404</div>;

  console.log(data);

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 border-slate-400 bg-slate-600">
          <Image
            width={128}
            height={96}
            src={data.profilePicture}
            alt={`${data.username || ""} profile picture`}
            className="absolute bottom-0 left-0 ml-4 -mb-[64px] rounded-full border-4 border-zinc-900"
          />
        </div>
        <div className="h-[64px]" />
        <div className="p-4 text-xl font-bold">@{data.username}</div>
        <div className="border-b border-slate-400" />
      </PageLayout>
    </>
  );
};

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import Image from "next/image";
import { PageLayout } from "~/components/layout";
import { appRouter } from "~/server/api/root";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("No slug");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
