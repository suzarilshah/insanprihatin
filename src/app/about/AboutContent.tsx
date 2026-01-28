'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const timeline = [
  {
    year: '2010',
    title: 'Foundation Established',
    description: 'Yayasan Insan Prihatin was founded with a mission to serve underprivileged communities.',
  },
  {
    year: '2013',
    title: 'First Major Project',
    description: 'Launched our first nationwide scholarship program, supporting 100 students.',
  },
  {
    year: '2016',
    title: 'Healthcare Initiative',
    description: 'Introduced mobile medical camps to reach rural communities without healthcare access.',
  },
  {
    year: '2019',
    title: 'Environmental Focus',
    description: 'Started the Green Malaysia Initiative with a goal of planting 100,000 trees.',
  },
  {
    year: '2022',
    title: 'Community Centers',
    description: 'Opened skill training centers in multiple states to empower local communities.',
  },
  {
    year: '2025',
    title: 'Major Milestone',
    description: 'Reached RM 15 million in total impact and 50,000 lives transformed.',
  },
]

const leadership = [
  {
    name: 'Dato\' Ahmad Rahman',
    position: 'Chairman',
    department: 'Board of Trustees',
    image: null,
  },
  {
    name: 'Puan Sri Fatimah Hassan',
    position: 'Deputy Chairman',
    department: 'Board of Trustees',
    image: null,
  },
  {
    name: 'Dr. Lee Wei Ming',
    position: 'Chief Executive Officer',
    department: 'Executive Leadership',
    image: null,
  },
  {
    name: 'Encik Mohd Azlan',
    position: 'Chief Operating Officer',
    department: 'Executive Leadership',
    image: null,
  },
  {
    name: 'Cik Nurul Aisyah',
    position: 'Director of Programs',
    department: 'Program Management',
    image: null,
  },
  {
    name: 'Mr. Rajesh Kumar',
    position: 'Director of Finance',
    department: 'Finance & Administration',
    image: null,
  },
  {
    name: 'Puan Siti Aminah',
    position: 'Director of Communications',
    department: 'Communications & PR',
    image: null,
  },
  {
    name: 'Encik Abdullah Ibrahim',
    position: 'Director of Partnerships',
    department: 'Strategic Partnerships',
    image: null,
  },
]

const departments = [
  { name: 'Board of Trustees', color: 'from-amber-500 to-amber-600' },
  { name: 'Executive Leadership', color: 'from-teal-500 to-teal-600' },
  { name: 'Program Management', color: 'from-sky-500 to-sky-600' },
  { name: 'Finance & Administration', color: 'from-emerald-500 to-emerald-600' },
  { name: 'Communications & PR', color: 'from-purple-500 to-purple-600' },
  { name: 'Strategic Partnerships', color: 'from-rose-500 to-rose-600' },
]

export default function AboutContent() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-teal-700 via-teal-600 to-sky-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat opacity-30" />
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-amber-400/10 rounded-full blur-[200px]" />

        <div className="relative container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-8 h-0.5 bg-amber-400 rounded-full" />
              <span className="text-amber-400 font-medium uppercase tracking-wider text-sm">About Us</span>
            </div>
            <h1 className="heading-display text-white mb-6">
              Our Story of{' '}
              <span className="text-gradient-amber">Compassion</span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              For over a decade, Yayasan Insan Prihatin has been at the forefront of
              community service, creating sustainable impact through education, healthcare,
              and development programs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-white">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-teal-100 to-teal-200">
                <Image
                  src="/images/logo-light.png"
                  alt="Yayasan Insan Prihatin"
                  fill
                  className="object-contain p-16"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="heading-section text-foundation-charcoal mb-8">
                What Drives Us
              </h2>

              <div className="space-y-8">
                <div className="p-6 bg-teal-50 rounded-2xl border-l-4 border-teal-500">
                  <h3 className="font-heading text-xl font-semibold text-teal-700 mb-3">
                    Our Mission
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    To empower underprivileged communities through sustainable programs in
                    education, healthcare, and economic development, creating lasting positive
                    change across Malaysia.
                  </p>
                </div>

                <div className="p-6 bg-amber-50 rounded-2xl border-l-4 border-amber-500">
                  <h3 className="font-heading text-xl font-semibold text-amber-700 mb-3">
                    Our Vision
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    A Malaysia where every individual has equal opportunities to thrive,
                    contribute to society, and live with dignity regardless of their
                    background or circumstances.
                  </p>
                </div>

                <div className="p-6 bg-sky-50 rounded-2xl border-l-4 border-sky-500">
                  <h3 className="font-heading text-xl font-semibold text-sky-700 mb-3">
                    Our Values
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['Compassion', 'Integrity', 'Excellence', 'Collaboration', 'Innovation'].map((value) => (
                      <span
                        key={value}
                        className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-foundation-cream">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="accent-line" />
              <span className="text-teal-600 font-medium uppercase tracking-wider text-sm">Our Journey</span>
            </div>
            <h2 className="heading-section text-foundation-charcoal">
              A Decade of Impact
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500 via-teal-400 to-amber-400 hidden lg:block" />

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex items-center gap-8 ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <div className="card-elegant p-6 inline-block">
                      <div className="font-display text-3xl font-bold text-teal-600 mb-2">
                        {item.year}
                      </div>
                      <h3 className="font-heading text-xl font-semibold text-foundation-charcoal mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-teal-500 border-4 border-white shadow-lg hidden lg:block" />

                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership / Organization Chart */}
      <section id="leadership" className="section-padding bg-white">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="accent-line" />
              <span className="text-teal-600 font-medium uppercase tracking-wider text-sm">Leadership</span>
            </div>
            <h2 className="heading-section text-foundation-charcoal mb-6">
              Meet Our Team
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our dedicated leadership team brings together decades of experience in
              philanthropy, business, and community development.
            </p>
          </motion.div>

          {/* Department Legend */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {departments.map((dept) => (
              <div key={dept.name} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${dept.color}`} />
                <span className="text-sm text-gray-600">{dept.name}</span>
              </div>
            ))}
          </div>

          {/* Leadership Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((member, index) => {
              const deptColor = departments.find((d) => d.name === member.department)?.color || 'from-gray-500 to-gray-600'

              return (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="card-elegant p-6 text-center group"
                >
                  {/* Avatar */}
                  <div className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br ${deptColor} flex items-center justify-center text-white text-2xl font-display font-bold`}>
                    {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>

                  <h3 className="font-heading text-lg font-semibold text-foundation-charcoal mb-1">
                    {member.name}
                  </h3>
                  <p className="text-teal-600 text-sm font-medium mb-2">{member.position}</p>
                  <p className="text-gray-500 text-xs">{member.department}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Annual Reports */}
      <section id="reports" className="section-padding bg-foundation-charcoal">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="w-8 h-0.5 bg-amber-400 rounded-full" />
                <span className="text-amber-400 font-medium uppercase tracking-wider text-sm">Transparency</span>
              </div>
              <h2 className="heading-section text-white mb-6">
                Annual Reports
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                We believe in complete transparency. Our annual reports provide detailed
                insights into our programs, financial allocation, and the impact we've
                created together with our donors and partners.
              </p>
              <div className="space-y-4">
                {['2025', '2024', '2023'].map((year) => (
                  <a
                    key={year}
                    href={`/reports/annual-report-${year}.pdf`}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-medium">Annual Report {year}</div>
                        <div className="text-gray-500 text-sm">PDF • 2.5 MB</div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-500 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-teal-800" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="font-display text-7xl font-bold text-white mb-4">100%</div>
                    <div className="text-xl text-white/80">Transparency</div>
                    <div className="text-teal-300 mt-2">Audited Annually</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-teal-700">
        <div className="container-wide text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-subsection text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Join us in our mission to create lasting positive change for communities across Malaysia.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/donate" className="btn-secondary">
                Donate Now
              </Link>
              <Link href="/contact" className="btn-outline border-white/30 text-white hover:bg-white hover:text-teal-600">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
