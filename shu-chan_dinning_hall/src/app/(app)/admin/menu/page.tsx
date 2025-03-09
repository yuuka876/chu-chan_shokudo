import MenuForm from '@/components/forms/menu-form';

export default function AdminMenuPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">メニュー管理</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <MenuForm selectedDate={new Date()} />
      </div>
    </div>
  );
}
