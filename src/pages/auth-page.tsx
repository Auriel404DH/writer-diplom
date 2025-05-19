import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Redirect } from "wouter";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(1, "Имя пользователя обязательно"),
  password: z.string().min(1, "Пароль обязателен"),
  remember: z.boolean().optional(),
});

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Имя пользователя должно содержать не менее 3 символов"),
    password: z.string().min(6, "Пароль должен содержать не менее 6 символов"),
    confirmPassword: z.string().min(1, "Подтверждение пароля обязательно"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(
      {
        username: values.username,
        password: values.password,
      },
      {
        onSuccess: () => {
          setLocation("/");
        },
      },
    );
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(
      {
        username: values.username,
        password: values.password,
      },
      {
        onSuccess: () => {
          setLocation("/login");
        },
      },
    );
  };

  if (user) {
    const redirectTo =
      new URLSearchParams(location.split("?")[1]).get("redirect") || "/";
    return <Redirect to={redirectTo} />;
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="flex items-center justify-center p-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center">
              <span className="text-primary text-3xl font-bold mr-1">
                Литера
              </span>
              <span className="text-secondary text-3xl font-bold">Крафт</span>
            </div>
          </div>

          <Tabs defaultValue="login" className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold">Добро пожаловать!</h2>
                <p className="text-muted-foreground mt-1">
                  Войдите, чтобы продолжить работу
                </p>
              </div>

              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Имя пользователя</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Введите имя пользователя"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Пароль</FormLabel>
                          <Button variant="link" className="h-auto p-0 text-xs">
                            Забыли пароль?
                          </Button>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Введите пароль"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="remember"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <Label htmlFor="remember" className="text-sm">
                          Запомнить меня
                        </Label>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Вход..." : "Войти"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold">Создайте аккаунт</h2>
                <p className="text-muted-foreground mt-1">
                  Начните свой творческий путь
                </p>
              </div>

              <Form {...registerForm}>
                <form
                  onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Имя пользователя</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Придумайте имя пользователя"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Пароль</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Придумайте пароль"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Подтвердите пароль</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Подтвердите пароль"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending
                      ? "Регистрация..."
                      : "Зарегистрироваться"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="hidden md:flex bg-gradient-to-r from-primary to-secondary items-center justify-center text-white p-8">
        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-bold">ЛитераКрафт</h1>
          <p className="text-xl font-serif">
            Платформа для писателей, где рождаются шедевры
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <i className="fas fa-pen-fancy"></i>
              </div>
              <div>
                <h3 className="font-medium text-lg">Удобный редактор</h3>
                <p>Создавайте, структурируйте и форматируйте ваши тексты</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <i className="fas fa-id-card"></i>
              </div>
              <div>
                <h3 className="font-medium text-lg">Карточки объектов</h3>
                <p>
                  Систематизируйте ваш творческий мир с помощью карточек
                  персонажей, локаций и событий
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <i className="fas fa-paint-brush"></i>
              </div>
              <div>
                <h3 className="font-medium text-lg">Персонализация</h3>
                <p>Настройте атмосферу творчества под свои предпочтения</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
