type Props = {
  label: string;
  children: React.ReactNode;
  name: string;
};

function Select({ label, children, name }: Props) {
  return (
    <label className="flex flex-col font-semibold">
      {label}
      <select
        name={name}
        className="border-black border-2 rounded-md text-lg p-2 text-black"
      >
        {children}
      </select>
    </label>
  );
}

export default Select;
