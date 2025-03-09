import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-500 hover:bg-blue-600 text-white',
            footerActionLink: 'text-blue-500 hover:text-blue-600'
          }
        }}
      />
    </div>
  );
}
