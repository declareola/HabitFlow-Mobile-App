import Page from "../apps/client/app/page";
import { FirebaseProvider } from "../apps/client/components/FirebaseProvider";

export default function App() {
  return (
    <FirebaseProvider>
      <Page />
    </FirebaseProvider>
  );
}

