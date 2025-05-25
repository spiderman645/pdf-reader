import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/pdf-studio');
  // redirect() throws an error to stop rendering, so no explicit return is needed.
}
