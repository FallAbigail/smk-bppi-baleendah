"""Generate report from the user's Word reference. Run with --reference PATH."""
from pathlib import Path
from copy import deepcopy
import argparse,json,hashlib,shutil
from docx import Document
from docx.shared import Inches,Pt,RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH,WD_BREAK,WD_TAB_ALIGNMENT,WD_TAB_LEADER
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph
from PIL import Image
BASE=Path(__file__).resolve().parent;ASSETS=BASE/'assets'
a=argparse.ArgumentParser();a.add_argument('--reference',required=True);args=a.parse_args();reference=Path(args.reference)
OUT=BASE/'Dokumentasi Project Website SMK BPPI Baleendah - Naufal Dzaki Fadhlurrohman.docx'
shutil.copy2(reference,OUT);doc=Document(OUT)
patterns={k:deepcopy(doc.paragraphs[i]._p) for k,i in {'body':75,'chapter':72,'h1':73,'h2':74,'caption':13}.items()}
table2=deepcopy(doc.tables[0]._tbl);table3=deepcopy(doc.tables[3]._tbl)
logo={e.get(qn('r:embed')) for e in doc.paragraphs[4]._p.iter(qn('a:blip'))};body=doc.element.body
for x in list(body)[11:]:
 if x.tag!=qn('w:sectPr'):body.remove(x)
for rid,rel in list(doc.part.rels.items()):
 if (rel.reltype.endswith('/image') and rid not in logo) or rel.reltype.endswith('/hyperlink'):doc.part.drop_rel(rid)
for i,text in [(0,'DOKUMENTASI PROJECT WEBSITE'),(1,'PROFIL SEKOLAH DAN PPDB ONLINE'),(2,'SMK BPPI Baleendah')]:
 z=doc.paragraphs[i];z.runs[0].text=text
 for r in z.runs[1:]:r.text=''
if 'Title' not in doc.styles:
 from docx.enum.style import WD_STYLE_TYPE
 st=doc.styles.add_style('Title',WD_STYLE_TYPE.PARAGRAPH);st.base_style=doc.styles['Normal']
doc.paragraphs[1].style=doc.styles['Title']
for r in doc.paragraphs[1].runs:r.font.name='Calibri';r.font.size=Pt(22);r.bold=True;r.font.color.rgb=RGBColor(0,0,0)
for sec in doc.sections:
 for hf in [sec.header,sec.first_page_header]:
  for z in hf.paragraphs:
   for r in z.runs:r.text=r.text.replace('DOKUMENTASI PROJECT PERPUSTAKAAN','DOKUMENTASI WEBSITE SEKOLAH')
doc.core_properties.title='Dokumentasi Project Website SMK BPPI Baleendah';doc.core_properties.author='Naufal Dzaki Fadhlurrohman';doc.core_properties.subject='Profil sekolah dan PPDB online';doc.core_properties.comments=''
figures=[];tables=[];book=0;pending_break=False

def cp(kind,text='',style=None):
 global pending_break
 el=deepcopy(patterns[kind])
 for x in list(el):
  if x.tag!=qn('w:pPr'):el.remove(x)
 body.insert(len(body)-1,el);z=Paragraph(el,doc._body)
 if style:z.style=style
 z.add_run(text)
 if pending_break:z.paragraph_format.page_break_before=True;pending_break=False
 return z

def p(text='',bold=False):
 z=cp('body',text);z.paragraph_format.keep_with_next=False
 if bold:z.runs[0].bold=True
 return z

def br():
 global pending_break
 pending_break=True

def front(text):
 br();z=cp('h1',text,'Normal');z.alignment=WD_ALIGN_PARAGRAPH.CENTER;z.paragraph_format.keep_with_next=True;z.paragraph_format.space_after=Pt(18)
 for r in z.runs:r.font.size=Pt(16);r.bold=True

def chapter(roman,text):
 br()
 if roman:z=cp('chapter','BAB '+roman);z.paragraph_format.keep_with_next=True
 z=cp('h1',text);z.paragraph_format.keep_with_next=True

def h(text):
 z=cp('h2',text);z.paragraph_format.keep_with_next=True;return z

def new_numbering(kind):
 root=doc.part.numbering_part.element
 ids=[int(x.get(qn('w:abstractNumId'))) for x in root.findall(qn('w:abstractNum'))]
 aid=max(ids,default=0)+1
 ab=OxmlElement('w:abstractNum');ab.set(qn('w:abstractNumId'),str(aid))
 lvl=OxmlElement('w:lvl');lvl.set(qn('w:ilvl'),'0')
 for tag,val in [('start','1'),('numFmt','bullet' if kind=='bullet' else 'decimal'),('lvlText','\u2022' if kind=='bullet' else '%1.')]:
  x=OxmlElement('w:'+tag);x.set(qn('w:val'),val);lvl.append(x)
 ab.append(lvl);root.append(ab)
 nids=[int(x.get(qn('w:numId'))) for x in root.findall(qn('w:num'))];nid=max(nids,default=0)+1
 n=OxmlElement('w:num');n.set(qn('w:numId'),str(nid));x=OxmlElement('w:abstractNumId');x.set(qn('w:val'),str(aid));n.append(x);root.append(n);return nid
bullet_id=None;step_id=None

def listpara(text,kind):
 global bullet_id,step_id
 previous=doc.paragraphs[-1].style.name
 z=doc.add_paragraph(text,style='List Bullet1' if kind=='bullet' else 'List Number1')
 if kind=='bullet':
  if bullet_id is None:bullet_id=new_numbering('bullet')
  nid=bullet_id
 else:
  if step_id is None or previous!='List Number1':step_id=new_numbering('decimal')
  nid=step_id
 np=OxmlElement('w:numPr');lv=OxmlElement('w:ilvl');lv.set(qn('w:val'),'0');np.append(lv);ni=OxmlElement('w:numId');ni.set(qn('w:val'),str(nid));np.append(ni);z._p.get_or_add_pPr().append(np)
 z.paragraph_format.left_indent=Inches(.2);z.paragraph_format.first_line_indent=Inches(-.18)
 return z

def bullet(text):return listpara(text,'bullet')
def step(text):return listpara(text,'decimal')

def code(text):
 z=doc.add_paragraph(text,style='Code');z.paragraph_format.keep_together=True;return z

def mark(z,name):
 global book
 book+=1;x=OxmlElement('w:bookmarkStart');x.set(qn('w:id'),str(book));x.set(qn('w:name'),name);z._p.insert(0,x)
 x=OxmlElement('w:bookmarkEnd');x.set(qn('w:id'),str(book));z._p.append(x)

def field(z,instruction,cache='1'):
 for typ,txt in [('begin',None),('instr',instruction),('separate',None),('text',cache),('end',None)]:
  r=OxmlElement('w:r')
  if typ in ['begin','separate','end']:x=OxmlElement('w:fldChar');x.set(qn('w:fldCharType'),typ)
  elif typ=='instr':x=OxmlElement('w:instrText');x.set(qn('xml:space'),'preserve');x.text=' '+txt+' '
  else:x=OxmlElement('w:t');x.text=txt
  r.append(x);z._p.append(r)

def caption(text,kind='Gambar'):
 arr=figures if kind=='Gambar' else tables;n=len(arr)+1;z=cp('caption',f'{kind} {n}. {text}');z.paragraph_format.keep_with_next=kind=='Tabel'
 name=('fig' if kind=='Gambar' else 'tab')+str(n);mark(z,name);arr.append((f'{kind} {n}. {text}',name))

def table(headers,rows,title):
 caption(title,'Tabel');el=deepcopy(table2 if len(headers)==2 else table3);body.insert(len(body)-1,el);t=Table(el,doc._body)
 head=deepcopy(t.rows[0]._tr);row=deepcopy(t.rows[1]._tr)
 for tr in list(el.findall(qn('w:tr'))):el.remove(tr)
 el.append(head)
 for _ in rows:el.append(deepcopy(row))
 for i,vals in enumerate([headers]+list(rows)):
  for j,txt in enumerate(vals):
   cell=t.cell(i,j);cell.text=str(txt)
   for z in cell.paragraphs:
    z.paragraph_format.space_before=Pt(0);z.paragraph_format.space_after=Pt(4);z.paragraph_format.line_spacing=1.1;z.paragraph_format.keep_with_next=False
    for r in z.runs:r.font.name='Calibri';r.font.size=Pt(10);r.bold=i==0;r.font.color.rgb=RGBColor(255,255,255) if i==0 else RGBColor(0,0,0)
   pr=cell._tc.get_or_add_tcPr();x=pr.find(qn('w:shd'))
   if x is None:x=OxmlElement('w:shd');pr.append(x)
   x.set(qn('w:fill'),'000000' if i==0 else 'FFFFFF')
  pr=t.rows[i]._tr.get_or_add_trPr();pr.append(OxmlElement('w:cantSplit'))
  if i==0:pr.append(OxmlElement('w:tblHeader'))
 t.autofit=False
 widths=[1.57,4.53] if len(headers)==2 else [1.34,1.57,3.19]
 if len(headers)==2 and 'Endpoint' in title:widths=[3.95,2.15]
 if title=='Daftar kebutuhan fungsional':widths=[.55,4.35,1.2]
 if title=='Masukan dan keluaran sistem':widths=[1.05,2.7,2.35]
 if title=='Inventaris tabel database':widths=[1.9,2.65,1.55]
 if title=='Struktur folder penting':widths=[2.15,3.95]
 if title=='Status pendaftaran PPDB':widths=[1.9,1.65,2.55]
 if title=='Hasil pemeriksaan yang dijalankan':widths=[2.7,.75,2.65]
 if title=='Cakupan pemeriksaan antarmuka':widths=[1.2,2.15,2.75]
 if title=='Teknologi utama aplikasi':widths=[1.65,1,3.45]
 for j,wi in enumerate(widths):
  t.columns[j].width=Inches(wi)
  for rr in t.rows:rr.cells[j].width=Inches(wi)
 z=doc.add_paragraph();z.paragraph_format.space_after=Pt(0)

def image(file,title,maxh=7,width=6):
 path=ASSETS/file;w,hg=Image.open(path).size;wi=min(width,maxh*w/hg)
 z=doc.add_paragraph();z.alignment=WD_ALIGN_PARAGRAPH.CENTER;z.paragraph_format.space_before=Pt(4);z.paragraph_format.space_after=Pt(0);z.paragraph_format.keep_with_next=True
 z.add_run().add_picture(str(path),width=Inches(wi))
 for e in z._p.iter(qn('wp:docPr')):e.set('descr',title)
 caption(title)

def figpage(section,file,title,description,maxh=7.2):
 br();h(section);p(description);image(file,title,maxh=maxh)

def screen(section,file,title,description,steps=(),note=''):
 br();h(section);p(description);image(file,title,maxh=5)
 if note:p(note)
 for s in steps:step(s)

front('IDENTITAS SISTEM')
p('Dokumen ini menjelaskan website profil SMK BPPI Baleendah beserta layanan PPDB online dan panel pengelolanya. Laporan dapat digunakan untuk memahami alur pengguna, struktur aplikasi, penyimpanan data, dan langkah perawatan.')
table(['Bagian','Keterangan'],[('Nama sistem','Website Profil SMK BPPI Baleendah'),('Jenis aplikasi','Profil sekolah dengan layanan PPDB, pesan, dan ulasan'),('Penyusun','Naufal Dzaki Fadhlurrohman'),('Kelas','XI PPLG'),('Instansi','SMK BPPI Baleendah'),('Tahun dokumentasi','2026'),('Tanggal pemeriksaan','1 November 2026'),('Pengguna','Pengunjung, calon siswa, orang tua atau wali, admin, dan admin utama'),('Teknologi utama','React, TypeScript, Vite, Tailwind CSS, Express, dan SQLite'),('Lingkungan lokal','Frontend port 5173 dan API port 3001'),('Versi acuan','Commit 85b03714 dan keadaan aplikasi saat dokumentasi disusun')], 'Identitas sistem')
p('Panduan membaca',True)
p('Bab I sampai IV membahas alasan pengembangan, kebutuhan, alur, dan rancangan. Bab V menjelaskan tampilan serta penggunaan. Bab VI menjelaskan hasil pemeriksaan dan batasnya. Bab VII memuat penerapan dan pemeliharaan, sedangkan Bab VIII berisi kesimpulan dan saran.')
front('KATA PENGANTAR')
p('Puji syukur ke hadirat Tuhan Yang Maha Esa karena dokumentasi website profil SMK BPPI Baleendah ini dapat diselesaikan. Laporan ini membahas aplikasi yang memperkenalkan sekolah dan menyediakan layanan pendaftaran peserta didik baru secara online.')
p('Website sekolah perlu menyampaikan informasi dengan jelas dan membantu pengunjung melakukan tindakan berikutnya. Karena itu, laporan ini juga membahas pilihan program keahlian, informasi sekolah, pesan pengunjung, ulasan, dan proses tindak lanjut PPDB oleh admin.')
p('Penjelasan disusun berdasarkan source code, struktur database, konfigurasi aplikasi, dan pemeriksaan tampilan melalui browser. Istilah teknis dijelaskan bersama kegunaannya agar laporan tetap dapat dipahami oleh pembaca yang sedang mempelajari pengembangan web.')
p('Saya berharap dokumentasi ini dapat digunakan sebagai bahan pembelajaran serta panduan untuk menjalankan dan merawat aplikasi. Pengembangan selanjutnya tetap perlu disesuaikan dengan kebijakan sekolah dan kebutuhan pengguna.')
p('Baleendah, 1 November 2026\n\nPenyusun,\n\nNaufal Dzaki Fadhlurrohman')
front('ABSTRAK')
p('Website Profil SMK BPPI Baleendah menggabungkan informasi sekolah dengan layanan interaktif. Pengunjung dapat melihat profil, program keahlian, ekstrakurikuler, galeri, berita, pengumuman, dan kontak. Calon siswa dapat mengirim formulir PPDB ketika periode dibuka oleh admin, kemudian memeriksa perkembangan pendaftaran menggunakan nomor pendaftaran dan kode pelacakan.')
p('Admin mengelola program beserta logo, informasi yang dipublikasikan, ulasan, pesan masuk, dan pendaftar PPDB. Pembayaran dan keputusan penerimaan tetap dikonfirmasi oleh petugas. Data pendaftar dapat diarsipkan dan dipulihkan. Riwayat disimpan menurut tahun ajaran sehingga penutupan periode tidak menghapus pendaftaran yang sudah diterima sistem.')
p('Antarmuka dibangun menggunakan React dan TypeScript dengan Vite serta Tailwind CSS. Express menangani API, sedangkan SQLite menyimpan data operasional. Akses admin memakai sesi berbasis cookie, kata sandi yang diolah menggunakan scrypt, pemeriksaan origin, dan pembatasan permintaan.')
p('Dokumentasi mencakup kebutuhan, flowchart yang ditulis dan dirender dari Mermaid, rancangan sistem, tampilan desktop dan mobile, panduan penggunaan, serta hasil pemeriksaan. Pengujian meliputi build produksi, sintaks server, respons API tertentu, dan tampilan browser. Pemeriksaan tersebut belum menggantikan pengujian operasional lengkap pada server produksi.')
p('Kata kunci: website sekolah, React, Express, SQLite, PPDB online, panel admin')
for sn in ['toc 1','toc 2']:
 st=doc.styles[sn];st.font.name='Calibri';st.font.size=Pt(10.5);st.paragraph_format.space_after=Pt(3);st.paragraph_format.line_spacing=1.05
front('DAFTAR ISI');field(doc.add_paragraph(),'TOC \\o "1-2" \\h \\z \\u','Daftar isi')
front('DAFTAR GAMBAR');figanchor=doc.add_paragraph()
front('DAFTAR TABEL');tabanchor=doc.add_paragraph()
chapter('I','PENDAHULUAN')
h('1.1 Latar Belakang')
p('Sekolah membutuhkan media resmi yang mudah diakses untuk memperkenalkan program pendidikan dan menyampaikan informasi. Jika profil, kegiatan, pengumuman, dan pendaftaran tersebar di tempat berbeda, pengunjung perlu mencari ulang informasi dan menghubungi sekolah untuk pertanyaan yang sama.')
p('Website SMK BPPI Baleendah menempatkan informasi tersebut dalam satu aplikasi. Halaman publik membantu calon siswa dan orang tua mengenali sekolah. Panel admin digunakan petugas untuk memperbarui konten tertentu dan menindaklanjuti layanan yang masuk.')
p('Pendaftaran online perlu diikuti pemeriksaan yang jelas. Formulir yang berhasil dikirim hanya menandakan data sudah tersimpan. Admin tetap memeriksa data, memberi arahan pembayaran, mengonfirmasi pembayaran, dan menentukan hasil penerimaan. Pendaftar melihat pembaruan melalui layanan cek status.')
h('1.2 Rumusan Masalah')
for x in ['Bagaimana menyajikan profil dan program agar mudah ditemukan dari desktop maupun ponsel?','Bagaimana menerima pendaftaran sesuai periode yang dibuka petugas?','Bagaimana memisahkan informasi status untuk pendaftar dari catatan internal admin?','Bagaimana menyimpan riwayat tahun ajaran dan memulihkan pendaftaran yang diarsipkan?','Bagaimana membatasi pengelolaan konten dan data layanan sesuai kewenangan akun?']:bullet(x)
h('1.3 Tujuan dan Manfaat')
p('Tujuan pengembangan adalah menyediakan informasi sekolah yang terstruktur dan layanan online yang dapat ditindaklanjuti. Pengunjung lebih mudah memahami pilihan pendidikan serta menghubungi sekolah. Petugas memperoleh data layanan dalam satu sistem dengan status yang dapat diperbarui.')
h('1.4 Batasan Sistem')
p('Sistem belum menyediakan pembayaran otomatis, unggah berkas PPDB, atau email otomatis. Profil guru, media tertentu, dan bagian statis halaman masih diperbarui melalui source code. Aplikasi ini tidak mencakup pengelolaan nilai, absensi siswa, atau pembayaran sekolah rutin.')
chapter('II','GAMBARAN UMUM SISTEM')
h('2.1 Konsep Aplikasi')
p('Halaman publik dapat dibuka tanpa akun. Petugas harus masuk ke panel admin untuk mengelola data. Perubahan disimpan melalui API ke database, lalu ditampilkan kembali sesuai kewenangan pengguna.')
table(['Pengguna','Kegiatan utama'],[('Pengunjung','Membaca profil, program, kegiatan, informasi, dan kontak; mengirim ulasan atau pesan.'),('Calon siswa dan wali','Mengisi PPDB saat dibuka, menyimpan nomor serta kode, dan mengikuti pembaruan status.'),('Admin','Mengelola program, pengumuman, ulasan, pesan, dan tindak lanjut pendaftaran.'),('Admin utama atau owner','Memiliki kemampuan admin serta membuat akun admin tambahan. Akun pertama dari terminal menjadi owner.')], 'Peran pengguna')
h('2.2 Teknologi yang Digunakan')
table(['Teknologi','Bagian','Kegunaan'],[('React 18 dan TypeScript','Frontend','Komponen antarmuka dan pemeriksaan tipe saat build.'),('Vite 5 dan Tailwind CSS 3','Tampilan','Server frontend, bundle produksi, dan tampilan responsif.'),('React Router','Navigasi','Pemetaan URL ke halaman.'),('Framer Motion dan Lenis','Interaksi','Animasi dan pengalaman scroll.'),('Express 5','Backend','Endpoint JSON, sesi, validasi, dan file produksi.'),('Node.js 22.13 atau lebih baru','Runtime','Menjalankan server dan modul node:sqlite.'),('SQLite','Database','Konten, akun, sesi, pesan, ulasan, dan pendaftaran.')], 'Teknologi utama aplikasi')
figpage('2.3 Flowchart Umum Sistem','01-alur-umum.png','Alur umum pengguna publik dan admin','Pengunjung mengakses informasi dan layanan tanpa login. Petugas masuk ke panel admin untuk mengelola data. Detail pemeriksaan login dijelaskan pada rancangan akses admin.',6.9)
br();h('2.4 Modul dan Struktur Project')
table(['Modul','Fungsi'],[('Profil dan beranda','Sekolah, fasilitas, visi misi, guru, lokasi, dan akses program serta PPDB.'),('Program dan ekstrakurikuler','Pilihan jurusan dan detail kegiatan.'),('Informasi dan galeri','Berita, pengumuman tayang, dan dokumentasi kegiatan.'),('Kontak dan ulasan','Pesan, percakapan privat, dan penilaian bintang.'),('PPDB','Periode, pendaftaran, cek status, riwayat, dan arsip.'),('Panel admin','Pengelolaan layanan serta akses petugas.')], 'Modul aplikasi')
table(['Lokasi','Tanggung jawab'],[('src/pages','Halaman router, termasuk PPDB, kontak, dan admin.'),('src/components/sections','Bagian publik, seperti hero, profil, program, dan galeri.'),('src/components/admin','Pengelola program, informasi, PPDB, ulasan, pesan, dan akun.'),('src/contexts dan src/lib','Konteks konten serta penghubung dengan API.'),('src/data dan public','Data statis dan aset yang dapat diakses browser.'),('server','Endpoint, validasi, kata sandi, dan akses SQLite.'),('data dan dist','Database privat serta hasil build. Database tidak masuk Git.')], 'Struktur folder penting')
p('Pemisahan ini membantu pengembangan satu fitur tanpa mengubah seluruh aplikasi. Tampilan PPDB admin berada di PpdbManager, sedangkan penyimpanan dan pengecekan izin tetap dijalankan pada server.')
chapter('III','ANALISIS KEBUTUHAN SISTEM')
h('3.1 Kebutuhan Fungsional')
table(['Kode','Kebutuhan','Pengguna'],[('KF01','Melihat profil, visi misi, guru, fasilitas, program, ekstrakurikuler, galeri, dan lokasi.','Publik'),('KF02','Membaca berita dan pengumuman yang telah dipublikasikan.','Publik'),('KF03','Mengirim ulasan dengan peran dan penilaian 1 sampai 5 bintang.','Publik'),('KF04','Mengirim pesan dan mengikuti percakapan privat.','Publik dan admin'),('KF05','Mengirim formulir PPDB saat periode dibuka.','Calon siswa'),('KF06','Memeriksa status menggunakan nomor dan kode pelacakan.','Calon siswa'),('KF07','Menambah, mengubah, dan menghapus program serta mengunggah logo.','Admin'),('KF08','Mengelola informasi, kategori, tanggal, dan status publikasi.','Admin'),('KF09','Membuka atau mengakhiri PPDB dan melihat riwayat per tahun ajaran.','Admin'),('KF10','Memperbarui status, pesan publik, dan catatan internal.','Admin'),('KF11','Mengarsipkan dan memulihkan pendaftaran.','Admin'),('KF12','Membalas pesan serta memoderasi ulasan.','Admin'),('KF13','Membuat akun admin tambahan.','Owner')], 'Daftar kebutuhan fungsional')
h('3.2 Kebutuhan Nonfungsional')
p('Antarmuka perlu dapat dipakai pada desktop dan ponsel. Formulir harus memberikan petunjuk serta pesan kesalahan yang dapat dipahami. Data privat hanya boleh diakses setelah pemeriksaan izin. Server perlu membatasi permintaan berulang dan menyimpan data pada disk yang tetap tersedia setelah proses dijalankan ulang.')
br();h('3.3 Aturan Operasional')
table(['Bagian','Aturan yang diterapkan'],[('Pembukaan PPDB','Admin menentukan tahun ajaran dan menyimpan keadaan terbuka. Server memeriksa keadaan periode ketika menerima formulir.'),('Status awal','Data yang tersimpan mendapat status baru. Pesan publik Pendaftaran diterima berarti formulir sudah diterima sistem, bukan keputusan penerimaan siswa.'),('Tindak lanjut','Status pembayaran dan penerimaan dipilih oleh petugas. Sistem tidak memproses pembayaran otomatis.'),('Akses status','Nomor pendaftaran dan kode pelacakan harus cocok. Catatan internal tidak diberikan kepada pendaftar.'),('Arsip','Arsip PPDB memakai penanda archived_at. Pemulihan mengembalikan data ke daftar aktif.'),('Penutupan periode','Akhiri PPDB menutup penerimaan formulir dan mempertahankan riwayat tahun ajaran.'),('Publikasi informasi','Draft hanya tersedia di panel admin.'),('Moderasi','Ulasan diperiksa manual. Penghapusan ulasan atau pesan tidak memakai arsip PPDB.')], 'Aturan operasional utama')
h('3.4 Data Masuk dan Keluaran')
table(['Proses','Masukan','Keluaran'],[('Pendaftaran','Identitas siswa, alamat, sekolah asal, program, kontak, dan wali.','Nomor pendaftaran dan kode pelacakan.'),('Cek status','Nomor dan kode pelacakan.','Status, program, waktu pembaruan, dan pesan publik.'),('Pesan','Nama, email, keperluan, isi pesan, dan kanal balasan.','Pesan tersimpan serta akses percakapan privat untuk kanal website.'),('Ulasan','Nama, peran, bintang, dan komentar.','Ulasan dan ringkasan penilaian.'),('Konten','Data program atau informasi.','Konten sesuai status publikasi.')], 'Masukan dan keluaran sistem')
figpage('3.5 Flowchart Pendaftaran PPDB','02-alur-ppdb.png','Alur pendaftaran PPDB online','Keadaan periode diperiksa sebelum formulir disimpan. Input yang salah perlu diperbaiki. Setelah penyimpanan berhasil, pendaftar menyimpan nomor dan kode untuk mengikuti tindak lanjut admin.')
figpage('3.6 Flowchart Pemeriksaan Status','07-pemeriksaan-status.png','Alur pembaruan dan pemeriksaan status PPDB','Admin memperbarui status setelah pemeriksaan manual. Pendaftar menggunakan dua kode layanan untuk membaca status dan pesan publik. Diagram ini tidak menetapkan urutan status otomatis.')
chapter('IV','PERANCANGAN SISTEM')
h('4.1 Arsitektur Aplikasi')
p('Browser menjalankan antarmuka React. Komponen halaman memakai konteks dan fungsi API untuk mengambil atau mengirim JSON. Express memeriksa permintaan dan menjalankan akses SQLite. Pada produksi, server juga menyajikan hasil build dari folder dist.')
image('04-arsitektur.png','Arsitektur frontend backend dan penyimpanan',5.8)
p('Aset lokal disediakan dari folder public. Sebagian media dan peta memerlukan layanan eksternal. Ketersediaan layanan, izin pemuatan aset, dan kebijakan keamanan konten perlu diperiksa kembali pada domain produksi.')
figpage('4.2 Rancangan Akses Admin','03-alur-admin.png','Alur login sesi dan peran admin','Login valid menghasilkan sesi dengan masa berlaku 12 jam. Peran diperiksa kembali oleh server. Hanya owner yang dapat menggunakan layanan pembuatan akun admin tambahan.')
br();h('4.3 Rancangan Database')
p('SQLite menyimpan sepuluh tabel aplikasi. Dua relasi foreign key dalam skema menghubungkan admin dengan sesi serta pesan dengan balasan. Tahun ajaran dan pilihan program pada pendaftaran digunakan sebagai hubungan logis, tetapi tidak mempunyai constraint foreign key pada skema saat ini.')
image('05-relasi-database.png','Relasi foreign key yang diterapkan dalam database',6.6)
p('ON DELETE CASCADE menjaga agar sesi mengikuti penghapusan akun dan balasan mengikuti pesan induknya. Diagram hanya menampilkan tabel dengan foreign key. Inventaris seluruh tabel dijelaskan berikutnya.')
br();h('4.4 Inventaris Tabel Database')
table(['Tabel','Kolom utama','Kegunaan'],[('admins','id, username, password_salt, password_hash, role','Akun dan peran pengelola.'),('sessions','token_hash, admin_id, created_at, expires_at','Sesi akun admin.'),('programs','title, description, subjects_json, level, icon, position, logo','Program serta urutan tampil.'),('announcements','title, body, category, date, published','Informasi dan publikasi.'),('reviews','name, role, rating, comment','Ulasan pengunjung.'),('contact_messages','name, phone, email, topic, message, status, reply_token_hash','Pesan dan akses percakapan.'),('contact_message_replies','message_id, body, sender, sender_name','Balasan percakapan.'),('ppdb_applications','application_number, tracking_hash, academic_year, status, archived_at','Pendaftar dan tindak lanjut.'),('ppdb_periods','academic_year, status, public_message, started_at, ended_at','Riwayat periode PPDB.'),('app_meta','key, value','Metadata dan pengaturan internal.')], 'Inventaris tabel database')
p('Waktu pembuatan dan pembaruan dicatat pada tabel yang membutuhkannya. Nomor pendaftaran bersifat unik. Token layanan disimpan dalam bentuk hash sehingga kode mentah tidak perlu disimpan dalam database.')
h('4.5 Pemisahan Data Publik dan Privat')
p('API publik menampilkan program serta informasi yang sudah tayang. Pendaftar, pesan masuk, akun, draft, dan catatan internal memerlukan sesi admin. Hasil cek status hanya memberikan bagian yang diperlukan pendaftar, bukan keseluruhan formulir.')
br();h('4.6 Rancangan Status PPDB')
table(['Nilai','Label admin','Makna'],[('baru','Baru mendaftar','Formulir tersimpan dan menunggu tindak lanjut.'),('ditinjau','Sedang ditinjau','Data sedang diperiksa.'),('perlu_konfirmasi','Perlu konfirmasi','Pendaftar perlu mengikuti arahan petugas.'),('menunggu_pembayaran','Menunggu pembayaran','Pembayaran ditunggu sesuai prosedur sekolah.'),('pembayaran_dikonfirmasi','Pembayaran dikonfirmasi','Petugas sudah memeriksa pembayaran.'),('diterima','Diterima','Keputusan penerimaan oleh admin.'),('tidak_diterima','Tidak diterima','Keputusan tidak diterima oleh admin.')], 'Status pendaftaran PPDB')
p('Server memeriksa nilai status, tetapi tidak mewajibkan urutan perpindahan tertentu. Sekolah perlu menetapkan prosedur petugas agar status konsisten. Pesan publik berisi arahan untuk pendaftar, sedangkan catatan internal hanya tampil pada panel admin.')
h('4.7 Rancangan Keamanan')
for x in ['Kata sandi diolah memakai scrypt dengan salt; token sesi dan token layanan diperiksa menggunakan hash.','Cookie sesi memakai HttpOnly, SameSite Strict, dan Secure pada mode produksi. Masa sesi dibatasi 12 jam.','Server memeriksa origin, sesi, peran owner untuk pembuatan akun, serta struktur input.','Pembatasan request diterapkan pada login dan layanan publik. Query SQL menggunakan parameter.','Helmet dan kebijakan keamanan konten mengatur respons. Produksi tetap memerlukan HTTPS, origin yang tepat, dan perlindungan file database.']:bullet(x)
figpage('4.8 Alur Pesan dan Balasan','06-pesan-dan-balasan.png','Sequence diagram pesan dan balasan melalui website','Pesan tersimpan, kemudian admin membalas melalui panel. Pengunjung membuka percakapan privat menggunakan token layanan. Balasan email otomatis belum menjadi bagian alur yang aktif.',6.6)
chapter('V','IMPLEMENTASI DAN PENGGUNAAN SISTEM')
h('5.1 Prinsip Tampilan dan Navigasi')
p('Website memakai warna biru sekolah, bidang terang, sudut membulat, dan hierarki teks. Navigasi mengarah ke beranda, tentang, program, ekstrakurikuler, galeri, informasi, kontak, dan PPDB. Pengaturan bahasa dan tema tersedia pada antarmuka.')
p('Desktop menggunakan beberapa kolom. Pada ponsel, menu dibuka dalam panel dan konten mengikuti lebar layar. Animasi membantu perpindahan perhatian, sedangkan informasi penting tetap disajikan sebagai teks.')
p('Gambar diambil dari aplikasi melalui browser. Tampilan privat admin menggunakan data contoh. Keadaan PPDB terbuka dan hasil status diperagakan dengan respons contoh di browser tanpa mengubah periode atau mengirim pendaftaran ke database operasional.')
image('08-beranda.png','Halaman beranda dan fasilitas sekolah',4.4)
p('Beranda memperkenalkan sekolah dan mengarahkan pengunjung ke program serta kontak. Kartu fasilitas menampilkan foto dan nama fasilitas. Bagian berikutnya memuat profil, program, informasi, lokasi, dan ajakan pendaftaran.')
screen('5.2 Profil Sekolah','09-tentang.png','Halaman tentang sekolah','Halaman tentang memuat identitas sekolah, penjelasan profil, visi misi, dan informasi pendukung.', ['Pilih menu Tentang.','Baca profil, visi misi, serta informasi guru.','Gunakan tautan menuju program atau kontak untuk mengetahui langkah berikutnya.'])
screen('5.3 Program Keahlian','10-program.png','Halaman program keahlian','Program ditampilkan dengan identitas jurusan dan ringkasan pembelajarannya. Data dari admin digunakan pada halaman publik.', ['Buka menu Program.','Pilih program untuk membaca detailnya.','Pada pilihan jurusan di beranda, tentukan jurusan agar informasi tampil sesuai pilihan.'])
screen('5.4 Ekstrakurikuler','11-ekskul.png','Halaman ekstrakurikuler','Daftar kegiatan memperkenalkan pengembangan minat dan keterampilan siswa.', ['Pilih menu Ekskul.','Buka salah satu kegiatan untuk membaca detailnya.','Kunjungi Galeri untuk melihat dokumentasi kegiatan sekolah.'])
br();h('5.5 Galeri dan Informasi Sekolah')
image('12-galeri.png','Galeri kegiatan sekolah',3.5)
p('Galeri menampilkan dokumentasi visual. Gunakan kategori atau kontrol yang tersedia untuk menelusuri gambar.')
image('13-informasi.png','Halaman berita dan pengumuman',3.5)
p('Informasi menampilkan konten yang sudah dipublikasikan. Draft yang disimpan admin belum muncul di daftar publik.')
screen('5.6 Mengirim Pesan kepada Sekolah','14-kontak.png','Formulir kontak melalui website','Formulir menyimpan identitas pengirim, keperluan, dan isi pesan agar petugas dapat menindaklanjutinya.', ['Isi nama, email, dan pesan. Tambahkan nomor telepon bila diperlukan.','Pilih keperluan dan kanal balasan.','Kirim formulir dan simpan tautan percakapan privat untuk kanal website.','Buka kembali tautan untuk membaca balasan atau mengirim lanjutan.'])
screen('5.7 Keadaan Periode PPDB','16-ppdb-aktual.png','Halaman PPDB sesuai keadaan server saat pemeriksaan','Halaman mengikuti pengaturan admin. Ketika ditutup, pendaftaran baru tidak diterima. Layanan cek status tetap dapat dipakai oleh pendaftar yang telah memiliki kode.', ['Buka halaman PPDB.','Periksa tahun ajaran serta pesan petugas.','Jika belum dibuka, ikuti informasi sekolah atau hubungi petugas.'])
screen('5.8 Mengisi Pendaftaran Online','17-ppdb-formulir.png','Formulir PPDB terbuka dengan data ilustrasi','Formulir tersedia setelah admin membuka periode dan menyimpan pengaturan.', ['Isi identitas siswa, alamat, sekolah asal, dan tahun lulus.','Pilih program dan isi kontak siswa serta wali.','Periksa data lalu kirim formulir.','Simpan nomor pendaftaran dan kode pelacakan setelah penyimpanan berhasil.'],'Gambar menggunakan respons contoh untuk memperagakan keadaan terbuka. Tidak ada pendaftaran baru yang dikirim saat pengambilan gambar.')
screen('5.9 Memeriksa Status Pendaftaran','18-status-ppdb.png','Hasil cek status PPDB dengan data ilustrasi','Pasangan nomor dan kode pelacakan digunakan untuk memeriksa data yang sesuai.', ['Masukkan nomor pendaftaran dan kode pelacakan.','Tekan Periksa status.','Baca status serta pesan petugas dan ikuti arahannya.','Simpan kode secara privat.'],'Contoh menampilkan Sedang ditinjau. Formulir yang tersimpan belum berarti calon siswa dinyatakan diterima.')
screen('5.10 Masuk ke Panel Admin','15-login-admin.png','Halaman masuk admin','Panel hanya tersedia bagi petugas yang mempunyai akun pada server.', ['Buka /admin.','Isi username dan kata sandi.','Tekan Masuk dengan aman.','Gunakan Keluar setelah selesai, terutama pada perangkat bersama.'],'Tidak ada akun bawaan. Akun awal dibuat melalui perintah admin:create di terminal server.')
screen('5.11 Ringkasan Panel Pengelola','19-admin-ringkasan.png','Ringkasan admin dengan data ilustrasi','Sidebar memisahkan modul kerja dan ringkasan menyediakan akses menuju tugas pengelolaan.', ['Pilih bagian kerja dari sidebar.','Perhatikan indikator koneksi sebelum menyimpan perubahan.','Gunakan Lihat situs untuk memeriksa halaman publik.'])
screen('5.12 Mengelola Program dan Logo','20-admin-program.png','Pengelolaan program keahlian','Admin mengatur program yang dipublikasikan pada website.', ['Buka Program keahlian lalu tambah atau edit program.','Isi nama, deskripsi, dan kompetensi. Pisahkan kompetensi dengan koma atau baris baru.','Tambahkan logo bila tersedia dan periksa pratinjau.','Simpan lalu periksa halaman publik.'],'Logo PNG, JPG, atau WebP dapat dipilih dengan batas 6 MB sebelum pengolahan browser. Sisi terpanjang diperkecil hingga 512 piksel agar ukuran data tersimpan terkendali.')
screen('5.13 Mengelola Informasi','21-admin-informasi.png','Pengelolaan informasi dan pengumuman','Informasi mempunyai judul, isi, kategori, tanggal, dan keadaan tayang.', ['Buka Informasi & PPDB.','Tambahkan atau edit informasi.','Pilih kategori dan tentukan draft atau tayang.','Simpan lalu periksa hasil di halaman Informasi.'])
screen('5.14 Membuka dan Mengakhiri PPDB','22-admin-periode.png','Pengaturan periode dan riwayat PPDB dengan data ilustrasi','Pengaturan dan riwayat berada pada bagian Pendaftar PPDB.', ['Isi tahun ajaran dan pesan untuk pengunjung.','Aktifkan penerimaan online lalu simpan.','Periksa keadaan halaman PPDB publik.','Gunakan Akhiri PPDB setelah selesai dan baca konfirmasinya. Data tetap tersedia menurut tahun ajaran.'])
screen('5.15 Menindaklanjuti Pendaftar','23-admin-detail-ppdb.png','Rincian pendaftar dan tindak lanjut dengan data ilustrasi','Rincian menampilkan identitas dan formulir tindak lanjut untuk petugas.', ['Buka Lihat data pendaftar dan tindak lanjut.','Pilih status sesuai pemeriksaan, termasuk pembayaran jika telah diverifikasi.','Isi pesan untuk pendaftar dan catatan internal.','Tekan Simpan tindak lanjut. Tombol tutup merapikan kembali rincian.'])
screen('5.16 Arsip dan Riwayat Tahun Ajaran','24-admin-arsip.png','Arsip PPDB dengan data ilustrasi','Data dapat dipindahkan dari daftar aktif dan dipulihkan bila diperlukan.', ['Pilih tahun ajaran.','Buka tab Arsip.','Gunakan Pulihkan untuk mengembalikan data ke daftar aktif.','Gunakan riwayat untuk memeriksa periode yang sudah berakhir.'],'Arsip tetap berada dalam database yang sama. Arsip tidak menggantikan backup jika file database hilang atau rusak.')
screen('5.17 Membalas Pesan Pengunjung','27-admin-pesan.png','Kotak pesan admin dengan data ilustrasi','Kotak pesan memuat topik, pengirim, waktu, keadaan dibaca, dan percakapan.', ['Buka Pesan Masuk dan pilih pesan.','Gunakan tindakan balasan untuk membaca percakapan dan menulis jawaban.','Kirim balasan website agar pengunjung membacanya dari tautan privat.','Periksa kembali isi jawaban serta status pesan.'],'Email otomatis belum aktif. Gunakan balasan website atau prosedur kontak sekolah yang tersedia.')
screen('5.18 Memoderasi Ulasan','28-admin-ulasan.png','Moderasi ulasan dengan data ilustrasi','Admin dapat membaca penilaian dan menyaring ulasan yang memerlukan perhatian.', ['Buka Ulasan.','Periksa bintang dan isi komentar.','Hapus ulasan bila melanggar aturan atau tidak sesuai.','Baca konfirmasi sebelum meneruskan penghapusan.'],'Penilaian rendah tidak otomatis berarti pelanggaran. Moderasi dilakukan manual. Ulasan yang dihapus tidak masuk arsip PPDB.')
screen('5.19 Menambahkan Admin','29-admin-akun.png','Pembuatan akun admin oleh owner dengan data ilustrasi','Menu Akun admin hanya tersedia bagi admin utama. Akun tambahan diberi peran admin.', ['Masuk sebagai owner.','Buka Akun admin dan isi username, kata sandi, serta konfirmasi.','Simpan akun dan berikan kredensial melalui saluran privat.','Gunakan perintah terminal untuk pemulihan kredensial seperti dijelaskan pada Bab VII.'])
br();h('5.20 Tampilan pada Ponsel')
p('Menu mobile menggunakan panel yang dapat dibuka dan ditutup. Tombol, konten, dan footer mengikuti lebar layar sehingga pengunjung tidak perlu memakai susunan desktop pada layar kecil.')
z=doc.add_paragraph();z.alignment=WD_ALIGN_PARAGRAPH.CENTER;z.paragraph_format.keep_with_next=True
for name in ['25-mobile-beranda.png','26-mobile-menu.png']:z.add_run().add_picture(str(ASSETS/name),height=Inches(5.6));z.add_run('  ')
caption('Beranda dan navigasi pada layar ponsel')
p('Gambar ponsel diambil pada viewport 390 x 844 piksel. Pemeriksaan perangkat fisik tetap diperlukan untuk menilai keyboard, orientasi, jaringan, dan kenyamanan sentuhan.')
chapter('VI','PENGUJIAN SISTEM')
h('6.1 Tujuan dan Lingkungan Pemeriksaan')
p('Pemeriksaan memastikan project dapat dibangun, server memiliki sintaks yang valid, dan endpoint tertentu memberikan respons sesuai batas akses. Antarmuka dibuka untuk memperoleh gambar serta memeriksa susunan halaman.')
p('Pemeriksaan dilakukan pada 1 November 2026 di lingkungan lokal dengan Chrome. Gambar desktop diambil pada lebar 1440 piksel dan mobile pada lebar 390 piksel. Preferensi reduced motion diaktifkan saat pengambilan gambar agar isi tampak stabil.')
h('6.2 Hasil Pemeriksaan Teknis')
table(['Pemeriksaan','Hasil','Arti hasil'],[('npm run build','Lulus','TypeScript dan bundle Vite berhasil.'),('node --check pada empat modul server','Lulus','index.mjs, database.mjs, validation.mjs, dan passwords.mjs valid secara sintaks.'),('GET /api/health','HTTP 200','API merespons.'),('GET /api/content','HTTP 200','Konten publik dapat diambil.'),('GET /api/ppdb/settings','HTTP 200','Pengaturan periode dapat dibaca.'),('GET /api/admin/ppdb tanpa sesi','HTTP 401','Pendaftar tidak dibuka tanpa autentikasi.'),('POST /api/ppdb/status dengan kode tidak terdaftar','HTTP 404','Kode tidak membuka data pendaftar.'),('Login admin melalui formulir','Berhasil','Sesi dapat dibuat di lingkungan lokal.'),('Render tujuh sumber Mermaid','Lulus','Semua sumber berhasil menjadi PNG.')], 'Hasil pemeriksaan yang dijalankan')
p('Build berhasil menunjukkan bahwa project dapat dikompilasi. Hasil ini tidak membuktikan bahwa setiap proses operasional, integrasi produksi, dan kondisi gagal sudah diuji lengkap.')
br();h('6.3 Pemeriksaan Antarmuka')
table(['Bagian','Cara diperiksa','Cakupan hasil'],[('Halaman publik','Membuka delapan halaman utama.','Halaman dirender dan diambil gambarnya.'),('Navigasi mobile','Membuka menu pada viewport ponsel.','Panel menu dan beranda ditampilkan.'),('PPDB terbuka','Respons pengaturan contoh di browser.','Formulir diperagakan tanpa mengubah periode server.'),('Hasil status','Respons status contoh di browser.','Tampilan hasil diperiksa, bukan bukti penyimpanan pendaftar nyata.'),('Panel admin','Sesi login dan data privat contoh.','Modul dibuka, rincian diperluas, dan tab arsip dipilih.'),('Data pribadi','Nama dan kontak contoh untuk layar privat.','Data pendaftar serta pesan sebenarnya tidak disalin ke laporan.')], 'Cakupan pemeriksaan antarmuka')
h('6.4 Pengujian Lanjutan')
for x in ['Uji satu siklus PPDB pada database uji: buka periode, kirim formulir, ubah status, cek status publik, arsipkan, pulihkan, lalu tutup periode.','Uji pesan sampai balasan admin dan lanjutan pengunjung menggunakan token privat.','Uji owner dan admin dengan dua akun berbeda, sesi kedaluwarsa, serta pemulihan kredensial.','Uji backup dan pemulihan pada salinan database terpisah.','Uji perangkat fisik, jaringan lambat, akses keyboard, pembaca layar, serta aset pada domain produksi.']:bullet(x)
p('Pengambilan gambar dengan data contoh tidak mengubah status, arsip, atau isi database operasional. Karena itu, alur tulis tersebut tidak dinyatakan telah lolos pengujian ujung ke ujung dalam pemeriksaan dokumentasi ini.')
chapter('VII','PENERAPAN DAN PEMELIHARAAN SISTEM')
h('7.1 Persiapan Lingkungan Lokal')
p('Gunakan Node.js 22.13 atau lebih baru dan npm. Backend memakai modul SQLite bawaan Node sehingga versi runtime perlu memenuhi persyaratan project.')
code('npm install\nnpm run dev')
p('Perintah dev menjalankan frontend dan API. Buka http://127.0.0.1:5173. Jika port berubah, pastikan origin dan proxy sesuai konfigurasi server. Jangan letakkan database dalam folder publik.')
h('7.2 Membuat dan Memulihkan Akses Admin')
code('npm run admin:create')
p('Perintah meminta username serta kata sandi melalui terminal. Akun pertama menjadi owner. Aplikasi tidak memiliki kata sandi bawaan. Jangan menuliskan kredensial ke source code atau laporan. Untuk pemulihan, gunakan perintah yang sesuai dari komputer server.')
code('npm run admin:reset-password\nnpm run admin:set-credentials')
p('Reset kata sandi atau perubahan kredensial mencabut sesi lama yang terkait. Batasi siapa yang berwenang menjalankan perintah tersebut dan simpan akses server secara privat.')
h('7.3 Menjalankan Mode Produksi')
code('npm run build\nnpm start')
p('Server produksi menyajikan frontend dan API pada port default 3001. Gunakan HTTPS dan disk persisten. Periksa halaman, aset eksternal, cookie, serta formulir setelah domain dipasang.')
br();h('7.4 Konfigurasi Server')
table(['Variabel','Kegunaan'],[('NODE_ENV','Perilaku produksi, termasuk cookie dan kebijakan keamanan.'),('APP_ORIGIN','Origin publik yang diperbolehkan untuk perubahan data.'),('PORT dan HOST','Port serta alamat dengar server.'),('DATABASE_PATH','Lokasi SQLite pada disk privat yang persisten.'),('TRUST_PROXY','Nilai 1 hanya saat berada di balik proxy tepercaya.')], 'Konfigurasi lingkungan penerapan')
h('7.5 Pencadangan dan Pemulihan')
p('Backup JSON panel hanya mencakup konten program dan informasi, bukan seluruh akun, pesan, ulasan, atau pendaftar. Lakukan backup SQLite secara terpisah untuk melindungi data operasional.')
for x in ['Tentukan jadwal, penanggung jawab, serta lokasi backup dengan akses terbatas.','Gunakan mekanisme backup SQLite yang konsisten. Jika menyalin manual, hentikan proses penulis database dan pastikan tidak ada transaksi aktif.','Perhatikan file WAL dan SHM ketika database aktif. Menyalin hanya file utama saat digunakan berisiko menghasilkan cadangan tidak lengkap.','Uji pemulihan pada direktori atau server terpisah dan periksa data sebelum mengandalkan backup.','Simpan database serta backup di luar Git dan folder publik.']:step(x)
h('7.6 Pemeliharaan Rutin')
p('Petugas perlu memeriksa pesan, ulasan, pendaftaran yang belum ditindaklanjuti, dan informasi kedaluwarsa. Pengembang memeriksa log, kapasitas disk, dependensi, layanan eksternal, dan backup. Sebelum memperbarui aplikasi, buat backup serta jalankan build dan pemeriksaan alur terkait.')
p('Setelah perubahan animasi, periksa scroll turun lalu naik dan navigasi kembali ke beranda. Track kartu fasilitas memiliki pengaturan sendiri dan penanda agar tidak disembunyikan animasi kemunculan halaman.')
chapter('VIII','KESIMPULAN DAN SARAN')
h('8.1 Kesimpulan')
p('Website SMK BPPI Baleendah menggabungkan informasi sekolah dengan layanan interaktif. Pengunjung dapat mengenali sekolah, melihat program dan kegiatan, membaca informasi, mengirim pesan, serta memberi ulasan. PPDB menyediakan formulir berdasarkan periode admin dan pemeriksaan status melalui nomor serta kode pelacakan.')
p('Panel memisahkan pengelolaan program, informasi, pendaftaran, ulasan, pesan, dan akun. Keputusan pembayaran maupun penerimaan tetap berada pada petugas. Arsip dan riwayat membantu pengelolaan PPDB, sedangkan backup tetap diperlukan untuk perlindungan data menyeluruh.')
p('React dan TypeScript menangani antarmuka, Express menangani API, dan SQLite menyimpan data. Build dan sintaks server berhasil diperiksa; beberapa endpoint memberikan respons sesuai batas akses. Pengujian operasional lengkap tetap perlu dijalankan pada lingkungan uji sebelum penerapan sebagai layanan utama.')
h('8.2 Saran Pengembangan')
for x in ['Tambahkan pengujian otomatis untuk PPDB, percakapan, izin admin, arsip, dan pemulihan.','Tetapkan prosedur perpindahan status serta konfirmasi pembayaran agar petugas memakai aturan yang konsisten.','Siapkan audit aktivitas dan backup terjadwal yang diuji pemulihannya.','Kembangkan unggah dokumen atau notifikasi setelah aturan privasi dan verifikasi disepakati.','Perluas pemeriksaan aksesibilitas dan performa pada perangkat serta jaringan pengguna.']:bullet(x)
p('Pengembangan berikutnya sebaiknya mengikuti alur yang sering digunakan dan masalah yang ditemukan saat pemakaian agar layanan meningkat tanpa menambah kerumitan yang belum dibutuhkan.')
chapter('','LAMPIRAN')
h('A Daftar Rute Halaman')
table(['Rute','Keterangan'],[('/','Beranda.'),('/tentang','Profil, visi misi, dan informasi pendukung.'),('/program dan /program/:slug','Daftar dan detail program.'),('/ekskul dan /ekskul/:slug','Daftar dan detail ekstrakurikuler.'),('/galeri','Dokumentasi kegiatan.'),('/informasi','Berita dan pengumuman.'),('/kontak','Kontak serta pengiriman pesan.'),('/ppdb','Formulir dan cek status.'),('/pesan/:trackingCode','Percakapan privat.'),('/privasi','Kebijakan privasi.'),('/admin','Login dan ruang kerja admin.')], 'Rute halaman aplikasi')
br();h('B Endpoint Publik Utama')
table(['Metode dan endpoint','Kegunaan'],[('GET /api/health','Kesehatan API.'),('GET /api/content','Konten publik.'),('GET dan POST /api/reviews','Membaca atau mengirim ulasan.'),('POST /api/contact/messages','Mengirim pesan.'),('POST /api/contact/messages/conversation','Membuka percakapan dengan token.'),('POST /api/contact/messages/conversation/replies','Mengirim lanjutan percakapan.'),('GET /api/ppdb/settings','Pengaturan PPDB.'),('POST /api/ppdb/applications','Mengirim pendaftaran.'),('POST /api/ppdb/status','Memeriksa status.')], 'Endpoint publik utama')
br();h('C Endpoint Admin Utama')
table(['Metode dan endpoint','Kegunaan'],[('GET /api/auth/session','Keadaan sesi.'),('POST /api/auth/login dan /logout','Masuk dan keluar.'),('GET /api/admin/content','Konten termasuk draft.'),('POST /api/admin/programs','Tambah program; PUT dan DELETE memakai /:id.'),('POST /api/admin/announcements','Tambah informasi; PUT dan DELETE memakai /:id.'),('GET /api/admin/ppdb','Pengaturan, pendaftar, arsip, dan periode.'),('PUT /api/admin/ppdb/settings','Mengatur periode.'),('POST /api/admin/ppdb/end','Mengakhiri PPDB.'),('PATCH /api/admin/ppdb/applications/:nomor','Status dan catatan.'),('POST /api/admin/ppdb/applications/:nomor/archive','Mengarsipkan.'),('POST /api/admin/ppdb/applications/:nomor/restore','Memulihkan.'),('GET /api/admin/reviews','Daftar ulasan; DELETE /:id untuk menghapus.'),('GET /api/admin/contact-messages','Daftar pesan.'),('POST /api/admin/contact-messages/:id/replies','Balasan; PATCH dan DELETE /:id untuk status atau penghapusan.'),('GET dan POST /api/admin/admins','Daftar dan pembuatan admin, khusus owner.')], 'Endpoint pengelolaan utama')
p('Perubahan memerlukan origin yang sesuai. Endpoint pengelolaan juga memerlukan sesi valid. Tabel merangkum rute utama; rincian validasi tetap mengikuti modul server.')
br();h('D Kamus Data Pendaftaran')
table(['Kelompok','Kolom penting'],[('Internal','id, application_number, tracking_hash, academic_year.'),('Identitas','student_name, birth_date, gender, address.'),('Kontak','student_phone, student_email, guardian_name, guardian_phone.'),('Sekolah asal','previous_school, graduation_year.'),('Pilihan dan keputusan','program_id, status, public_message, internal_note.'),('Waktu dan arsip','created_at, updated_at, archived_at.')], 'Kelompok data pendaftaran')
h('E Istilah Penting')
table(['Istilah','Penjelasan'],[('Frontend','Bagian aplikasi pada browser.'),('Backend dan API','Server dan jalur permintaan data.'),('SQLite','Database yang disimpan dalam file.'),('Hash','Hasil satu arah untuk memeriksa kata sandi atau token tanpa menyimpan kode mentah.'),('Sesi','Bukti login dengan masa berlaku.'),('Owner','Admin utama yang dapat membuat admin tambahan.'),('Arsip','Pendaftaran di luar daftar aktif yang dapat dipulihkan.'),('Backup','Salinan terpisah untuk pemulihan.'),('Mermaid','Bahasa teks untuk diagram yang dirender menjadi gambar.')], 'Glosarium istilah')
br();h('F Sumber Diagram Mermaid')
p('Diagram disimpan pada docs/dokumentasi-project/mermaid. File .mmd ditulis lalu dijalankan dengan Mermaid CLI menjadi PNG. Berikut kode alur pendaftaran yang digunakan dalam laporan.')
code((BASE/'mermaid/02-alur-ppdb.mmd').read_text(encoding='utf-8-sig'))
p('Contoh perintah render satu diagram setelah Mermaid CLI dipasang:')
code('mmdc -i mermaid/02-alur-ppdb.mmd -o assets/02-alur-ppdb.png -c mermaid/theme.json --size 1800 -s 2 -b white')
p('Jalankan perintah render dalam satu baris. Lokasi Chrome dapat diberikan melalui konfigurasi Puppeteer sesuai komputer. Diagram lain memuat alur umum, login, cek status, arsitektur, relasi database, dan urutan pesan.')
h('G Sumber Acuan Project')
for x in ['README.md dan package.json untuk runtime, perintah kerja, serta dependensi.','src/App.tsx, src/pages, dan src/components untuk rute dan antarmuka.','src/data/ppdb.ts dan PpdbManager.tsx untuk status, periode, riwayat, serta arsip.','server/index.mjs, validation.mjs, database.mjs, dan passwords.mjs untuk API, validasi, akses data, serta keamanan.','Skema SQLite tanpa baris data pribadi serta pemeriksaan browser dan API tanggal 1 November 2026.']:bullet(x)
p('Repositori pribadi: https://github.com/FallAbigail/smk-bppi-baleendah\nRepositori organisasi: https://github.com/Speth-Labs/smk-bppi-baleendah')
for anchor,items in [(figanchor,figures),(tabanchor,tables)]:
 for title,name in items:
  el=OxmlElement('w:p');anchor._p.addprevious(el);z=Paragraph(el,doc._body);z.style=doc.styles['Normal'];z.paragraph_format.space_after=Pt(4);z.paragraph_format.line_spacing=1
  z.paragraph_format.tab_stops.add_tab_stop(Inches(5.95),WD_TAB_ALIGNMENT.RIGHT,WD_TAB_LEADER.DOTS)
  z.add_run(title+'\t');field(z,f'PAGEREF {name} \\h')
  for r in z.runs:r.font.size=Pt(9.5)
 anchor._p.getparent().remove(anchor._p)
for x in doc.element.iter(qn('w:fldChar')):
 if x.get(qn('w:fldCharType'))=='begin':x.set(qn('w:dirty'),'true')
x=doc.settings.element.find(qn('w:updateFields'))
if x is None:x=OxmlElement('w:updateFields');doc.settings.element.append(x)
x.set(qn('w:val'),'true')
doc.save(OUT)
manifest={'output':OUT.name,'reference_sha256':hashlib.sha256(reference.read_bytes()).hexdigest(),'figures':figures,'tables':tables,'reference_commit':'85b03714f0d12fe619a43b9360514d514faefd4c','generated':'2026-11-01','privacy':'Private screenshots use browser fixtures; no operational records were written.'}
(BASE/'document-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(OUT);print(f'{len(figures)} figures, {len(tables)} tables')
