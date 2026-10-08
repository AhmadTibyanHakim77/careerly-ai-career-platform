<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CareerWorkspaceSeeder extends Seeder
{
    public function run(): void
    {
        $jobs = [
            ['linear-product', 'Product Designer', 'Linear', 'Remote', 'Full-time', '$120k–$160k', ['Product design', 'Figma', 'Design systems'], 'Rancang pengalaman produk yang intuitif bersama tim produk dan engineering.', 'Create intuitive product experiences with product and engineering teams.', 'L', 'bg-violet-100 text-violet-700'],
            ['notion-ux', 'UX Designer', 'Notion', 'Remote', 'Full-time', '$110k–$145k', ['UX research', 'Prototyping', 'Figma'], 'Bantu jutaan pengguna bekerja lebih baik melalui pengalaman yang sederhana.', 'Help millions of people work better through thoughtful, simple experiences.', 'N', 'bg-neutral-100 text-neutral-800'],
            ['vercel-senior', 'Senior Product Designer', 'Vercel', 'New York · Hybrid', 'Full-time', '$145k–$190k', ['Design systems', 'Prototyping', 'Collaboration'], 'Pimpin arah desain dan bangun sistem desain untuk platform developer.', 'Lead design direction and build design systems for a developer platform.', '▲', 'bg-zinc-900 text-white'],
            ['figma-product', 'Product Designer', 'Figma', 'Remote', 'Full-time', '$130k–$170k', ['Product design', 'Figma', 'User research'], 'Bentuk alat kolaborasi kreatif yang digunakan tim di seluruh dunia.', 'Shape creative collaboration tools used by teams around the world.', 'F', 'bg-orange-50 text-orange-700'],
            ['airbnb-ux', 'UX Designer', 'Airbnb', 'Remote', 'Full-time', '$125k–$165k', ['UX research', 'Accessibility', 'Prototyping'], 'Rancang perjalanan pengguna yang membantu orang merasa diterima di mana saja.', 'Design guest journeys that help people feel at home anywhere.', 'A', 'bg-rose-50 text-rose-600'],
            ['stripe-design', 'Product Designer', 'Stripe', 'San Francisco · Hybrid', 'Full-time', '$140k–$185k', ['Product design', 'Design systems', 'Analytics'], 'Sederhanakan pengalaman pembayaran dan keuangan digital bagi bisnis.', 'Simplify payments and financial experiences for businesses.', 'S', 'bg-indigo-50 text-indigo-700'],
            ['github-fullstack', 'Full Stack Developer', 'GitHub', 'Remote · Indonesia', 'Full-time', 'Rp 25–40 jt/bln', ['React', 'TypeScript', 'Node.js', 'SQL', 'API design'], 'Bangun fitur web end-to-end untuk pengalaman developer.', 'Build end-to-end web features for developer experiences.', 'G', 'bg-slate-900 text-white'],
            ['tokopedia-fullstack', 'Full Stack Engineer', 'Tokopedia', 'Jakarta · Hybrid', 'Full-time', 'Rp 20–35 jt/bln', ['React', 'Laravel', 'PHP', 'MySQL', 'REST API'], 'Kembangkan layanan marketplace dengan frontend dan backend yang andal.', 'Develop reliable marketplace services across frontend and backend.', 'T', 'bg-emerald-50 text-emerald-700'],
            ['goto-data', 'Data Analyst', 'GoTo', 'Jakarta · Hybrid', 'Full-time', 'Rp 18–30 jt/bln', ['SQL', 'Python', 'Data analysis', 'Tableau', 'Statistics'], 'Gunakan data untuk membantu tim produk menentukan prioritas.', 'Use data to help product teams make better decisions.', 'G', 'bg-green-50 text-green-700'],
            ['traveloka-backend', 'Backend Developer', 'Traveloka', 'Jakarta · Hybrid', 'Full-time', 'Rp 22–38 jt/bln', ['PHP', 'Laravel', 'SQL', 'Redis', 'API design'], 'Rancang API dan layanan backend berskala besar.', 'Design APIs and scalable backend services.', 'T', 'bg-sky-50 text-sky-700'],
        ];
        foreach ($jobs as [$slug, $role, $company, $location, $type, $salary, $skills, $id, $en, $mark, $color]) {
            DB::table('job_postings')->updateOrInsert(['slug' => $slug], [
                'role' => $role, 'company' => $company, 'location' => $location, 'employment_type' => $type,
                'salary' => $salary, 'skills' => json_encode($skills), 'description_id' => $id, 'description_en' => $en,
                'mark' => $mark, 'color' => $color, 'is_active' => true, 'created_at' => now(), 'updated_at' => now(),
            ]);
        }

    }
}
