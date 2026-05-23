async function run() {
  try {
    const res = await fetch("https://campus-find-app.vercel.app/api/trpc/college.list?input=%7B%22json%22%3A%7B%22limit%22%3A50%7D%7D");
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text.substring(0, 500)); // Log first 500 chars
  } catch(e) {
    console.error(e);
  }
}
run();
