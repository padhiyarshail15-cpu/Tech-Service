import { useCounter } from "@/hooks/useCounter";

interface CounterProps {
  initialValue?: number;
}

export function Counter({ initialValue = 0 }: CounterProps) {
  const { count, increment } = useCounter(initialValue);

  return (
    <button type="button" className="counter" onClick={increment}>
      Count is {count}
    </button>
  );
}
