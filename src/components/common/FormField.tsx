
import {
  FormControl,

  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control, Controller, FieldValues, Path } from "react-hook-form";


// A generic interface that works with any form structure
// T is the form’s data type, like { email: string, password: string }
// FieldValues is a built-in type from react-hook-form that represents a generic form object
interface FormFieldProps<T extends FieldValues>{
  //  Required to connect this input field to React Hook Form
  // This comes from useForm().control and manages the field's state
  control:Control<T>;
   // Field name for this input — must exactly match one of the field names in our form data type T
  // Example: if our form has { email, password }, then name can only be "email" or "password"
  name:Path<T>;
  label:string;
  plcaeholder?:string;
  // it only accepts these types 
  type?:"text"|"email"|"password"|"file"

}

const FormField = ({control,name,label,plcaeholder,type="text"}:FormFieldProps<T>) => (

  <Controller
  name={name}
  control={control}
  render={({field})=>(
    <FormItem>
    <FormLabel>{label}</FormLabel>
    <FormControl>
      <Input 
      type={type}
      placeholder={plcaeholder} 
     className="no-focus-glow"
      {...field} />
    </FormControl>
   
    <FormMessage />
  </FormItem>
  )}
  />
  
)

export default FormField

