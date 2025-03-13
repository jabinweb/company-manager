import { createUploadthing, type FileRouter } from "uploadthing/server";
import { getServerSession } from '@/lib/server-session'

const f = createUploadthing({
  errorFormatter: (err) => {
    console.error("Upload error:", err);
    return { message: "Upload failed - please try again" };
  }
});

export const ourFileRouter = {
  imageUploader: f({
    image: { 
      maxFileSize: "4MB", 
      maxFileCount: 1 
    }
  })
    .middleware(async ({ req }) => {
      try {
        const session = await getServerSession()
        if (!session?.user) throw new Error("Unauthorized");
        return { userId: session.user.id };
      } catch (error) {
        console.error("Upload middleware error:", error);
        throw new Error("Authentication failed");
      }
    })
    .onUploadComplete(async ({ file, metadata }) => {
      try {
        console.log("Upload completed:", { file, metadata });
        return { url: file.url };
      } catch (error) {
        console.error("Upload completion error:", error);
        throw new Error("Failed to process upload");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;