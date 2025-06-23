
import {
  FormControl,

  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control, Controller, FieldValues, Path } from "react-hook-form";


interface FormFieldProps<T extends FieldValues>{
  control:Control<T>;
  name:Path<T>;
  label:string;
  plcaeholder?:string;
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
      {...field} />
    </FormControl>
   
    <FormMessage />
  </FormItem>
  )}
  />
  
)

export default FormField

