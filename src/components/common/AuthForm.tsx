"use client"

import { Button } from "@/components/ui/button"

import { zodResolver } from "@hookform/resolvers/zod"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { auth } from "../../../firebase/client"
import { Signin, Signup } from "../../../lib/actions/auth.action"
import { Form } from "../ui/form"
import FormField from "./FormField"


// form schema validation based on the form type
const authFormSchema=(type:FormType)=>{
  return z.object({
    name:type==="sign-up"?z.string().min(3,"username required"):z.string().optional(),
    email:z.string().email("Invalid email"),
    password:z.string().min(5)
  })
}

// AuthForm component
const AuthForm = ({type}:{type:FormType}) => {

  const router = useRouter()

  const formSchema = authFormSchema(type)

  // form instance
   const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name:"",
      email:"",
      password:""
    },
  })

  

  // onsubmit functionality
 async function onSubmit(values: z.infer<typeof formSchema>) {
    
    try{
      if(type === 'sign-up'){

        const{name,email,password}=values

        // Create a new user using Firebase Authentication
        const userCredentials= await createUserWithEmailAndPassword(auth,email,password)

        // Call server-side signUp() with UID to save name and email in Firestore
        const result=await Signup({
          uid:userCredentials.user.uid,
          name:name!,
          email,
          password

        })

        // console.log("Signup result from server:", result);
        // Handle signup failure
        if(!result.success){
          console.log(result.message)
          toast.error(result.message)
          return
        }

       
       // On success: show toast and redirect user to the sign-in page
        toast.success("Account create successfully , please sign-in.")
        console.log("Sign Up",values)
        router.push('/sign-in')

      }else{

        // Handle user sign-in
        const{email,password}=values

        // Firebase Auth (client-side) to sign in with email and password
        const userCredentials=await signInWithEmailAndPassword(auth,email,password)

        // Get the ID token from the signed-in user
        const idToken=await userCredentials.user.getIdToken()

        // If token is missing, show an error
        if(!idToken){
          toast.error("Sign in failed,Please try again.")
          return
        }

        // call  server-side signIn() to set the session cookie
        await Signin({
          email,
          idToken
        })

        toast.success("Signin successfully")
        console.log("Sign In",values)
        router.push("/")
      }
    }catch(error){
      console.log("error",error)
      toast.error(`There was an error:${error}`)
    }
  }


  const isSignIn=type==="sign-in"

  return (
    <div >
      <div className="flex flex-col gap-3 items-center mt-2 mb-5 md:mb-8 ">
        <div className="flex justify-center items-center gap-2">
          <Image
           src="/logo.svg"
            alt="logo" 
            width={32} 
            height={32}/>
          <p className="text-xl  md:text-2xl font-bold">nextjobtool-ai</p>
        </div>
        <p className=" text-sm md:text-base  mt-1 md:my-2 font-bold ">Practice Job Interviews With AI</p>
       
      </div>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-5 md:space-y-8  ">

        {!isSignIn&& (
          <FormField
          control={form.control}
          name="name"
          label="Username"
          plcaeholder="Your Username"
          />
        )}
        <FormField
          control={form.control}
          name="email"
          label="Email"
          plcaeholder="Your Email"
          type="email"
          />
        <FormField
          control={form.control}
          name="password"
          label="Password"
          plcaeholder="Your Password"
          type="password"
          />
        
        <Button  className="bg-violet-500 text-white w-full  rounded-3xl" type="submit">
          {!isSignIn?"Create an account":"Signin"}

        </Button>

        <p className="text-center text-sm md:text-base">{!isSignIn?"Already have an account":"Don't have an account"} ?
        <Link href={!isSignIn?"/sign-in":"/sign-up"} className="text-violet-500 mx-1 ">{!isSignIn?"sign-in":"sign-up"}</Link>
        </p>
        

      </form>
    </Form>
   
    </div>
  )
}

export default AuthForm

