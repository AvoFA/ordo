import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import {
  listNotesForUser,
  listNoteTopicOptionsForUser,
} from "@/entities/note/api/notes.repository";
import { NotesOverview } from "@/widgets/notes-overview/notes-overview";
import { runInDemoMode, isDemoModeActive, demoNotes, demoNoteOptions } from "@/shared/lib/demo";

export default async function NotesPage() {
  const session = await auth();
  const isDemo = isDemoModeActive();
  let userEmail = session?.user?.email;

  if (!userEmail && isDemo) {
    userEmail = "demo@ordo.app";
  }

  if (!userEmail) {
    redirect("/sign-in");
  }

  const [notes, topicOptions] = await Promise.all([
    runInDemoMode(() => listNotesForUser(userEmail), demoNotes),
    runInDemoMode(() => listNoteTopicOptionsForUser(userEmail), demoNoteOptions),
  ]);

  return <NotesOverview notes={notes} topicOptions={topicOptions} />;
}
