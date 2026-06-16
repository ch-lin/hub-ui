import { redirect } from 'next/navigation';

export default function HomePage() {
  // The dashboard page is not a functional dashboard yet, so we redirect users
  // to the most useful page, which is the videos list.
  redirect('/youtube/videos');
}