import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

export default function VerifyEmailLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Spinner className="size-6" />
          </EmptyMedia>
          <EmptyTitle>Confirmando seu e-mail</EmptyTitle>
          <EmptyDescription>
            Aguarde enquanto validamos o seu link de confirmação.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
