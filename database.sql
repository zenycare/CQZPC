CREATE DATABASE IF NOT EXISTS job_portal_node CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE job_portal_node;

DROP TABLE IF EXISTS job_applications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS employer_profiles;
DROP TABLE IF EXISTS candidate_profiles;
DROP TABLE IF EXISTS careers;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('candidate', 'employer', 'admin') NOT NULL,
  phone VARCHAR(50) NULL,
  address VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE candidate_profiles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  headline VARCHAR(255) NULL,
  cv_file VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_candidate_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE employer_profiles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  company_slug VARCHAR(255) NOT NULL,
  company_description TEXT NULL,
  company_website VARCHAR(255) NULL,
  company_logo VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_employer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE careers (
  id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  status TINYINT NOT NULL DEFAULT 1,
  isPopular TINYINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE jobs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  career_id BIGINT UNSIGNED NOT NULL,
  job_type VARCHAR(100) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  vacancy INT NOT NULL DEFAULT 1,
  salary VARCHAR(255) NULL,
  job_level VARCHAR(255) NULL,
  description MEDIUMTEXT NULL,
  benefits MEDIUMTEXT NULL,
  responsibility MEDIUMTEXT NULL,
  qualifications MEDIUMTEXT NULL,
  keywords TEXT NULL,
  experience VARCHAR(255) NULL,
  company_name VARCHAR(255) NOT NULL,
  province VARCHAR(255) NULL,
  district VARCHAR(255) NULL,
  wards VARCHAR(255) NULL,
  location_detail VARCHAR(255) NULL,
  company_website VARCHAR(255) NULL,
  expiration_date DATE NULL,
  status ENUM('pending', 'approved', 'rejected', 'closed') NOT NULL DEFAULT 'pending',
  is_featured TINYINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_jobs_career FOREIGN KEY (career_id) REFERENCES careers(id),
  CONSTRAINT fk_jobs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE job_applications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  job_id BIGINT UNSIGNED NOT NULL,
  candidate_id BIGINT UNSIGNED NOT NULL,
  cv_file VARCHAR(255) NOT NULL,
  note TEXT NULL,
  status ENUM('pending', 'reviewed', 'interview', 'rejected', 'hired') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_job_candidate (job_id, candidate_id),
  CONSTRAINT fk_app_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_app_candidate FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO careers (id, name, status, isPopular) VALUES
(1, 'An ninh / Bảo vệ', 1, 0),
(2, 'An toàn lao động', 1, 0),
(3, 'Bán hàng / Kinh doanh', 1, 0),
(4, 'Bán lẻ / Bán sỉ', 1, 0),
(5, 'Báo chí / Biên tập viên / Xuất bản', 1, 0),
(6, 'Bảo hiểm', 1, 0),
(7, 'Bảo trì / Sửa chữa', 1, 0),
(8, 'Bất động sản', 1, 0),
(9, 'Biên phiên dịch / Thông dịch viên', 1, 0),
(10, 'Biên phiên dịch (tiếng Nhật)', 1, 0),
(11, 'Chăm sóc sức khoẻ / Y tế', 1, 1),
(12, 'CNTT - Phần cứng / Mạng', 1, 1),
(13, 'CNTT - Phần mềm', 1, 1),
(14, 'Dầu khí / Khoáng sản', 1, 0),
(15, 'Dệt may / Da giày', 1, 0),
(16, 'Dịch vụ khách hàng', 1, 0),
(17, 'Điện lạnh / Nhiệt lạnh', 1, 0),
(18, 'Du lịch', 1, 0),
(19, 'Dược / Sinh học', 1, 0),
(20, 'Điện / Điện tử', 1, 0),
(21, 'Đồ gỗ', 1, 0),
(22, 'Giáo dục / Đào tạo / Thư viện', 1, 0),
(23, 'Hàng gia dụng', 1, 0),
(24, 'Hoá chất / Sinh hoá / Thực phẩm', 1, 0),
(25, 'Kế toán / Kiểm toán', 1, 1),
(26, 'Khách sạn', 1, 1),
(27, 'Kiến trúc', 1, 0),
(28, 'Kỹ thuật ứng dụng / Cơ khí', 1, 0),
(29, 'Lao động phổ thông', 1, 0),
(30, 'Môi trường / Xử lý chất thải', 1, 0),
(31, 'Mới tốt nghiệp / Thực tập', 1, 0),
(32, 'Ngân hàng / Chứng khoán', 1, 0),
(33, 'Nghệ thuật / Thiết kế / Giải trí', 1, 0),
(34, 'Nhà hàng / Dịch vụ ăn uống', 1, 0),
(35, 'Nhân sự', 1, 0),
(36, 'Nội thất / Ngoại thất', 1, 0),
(37, 'Nông nghiệp / Lâm nghiệp', 1, 1),
(38, 'Ô tô', 1, 0),
(39, 'Pháp lý / Luật', 1, 0),
(40, 'Phi chính phủ / Phi lợi nhuận', 1, 0),
(41, 'Quản lý chất lượng (QA / QC)', 1, 0),
(42, 'Quản lý điều hành', 1, 0),
(43, 'Quảng cáo / Khuyến mãi / Đối ngoại', 1, 0),
(44, 'Sản xuất / Vận hành sản xuất', 1, 0),
(45, 'Tài chính / Đầu tư', 1, 0),
(46, 'Thời trang', 1, 0),
(47, 'Thuỷ Hải Sản', 1, 0),
(48, 'Thư ký / Hành chánh', 1, 0),
(49, 'Tiếp thị', 1, 0),
(50, 'Tư vấn', 1, 0),
(51, 'Vận chuyển / Giao thông / Kho bãi', 1, 0),
(52, 'Viễn thông / Xây dựng', 1, 0),
(53, 'Xây dựng', 1, 0),
(54, 'Viễn thông', 1, 0),
(55, 'Xây dựng', 1, 0),
(56, 'Xuất nhập khẩu / Ngoại thương', 1, 0);

INSERT INTO users (id, name, email, password, role, phone, address) VALUES
(1, 'Administrator', 'admin@job.com', 'admin123', 'admin', '0900000000', 'Hồ Chí Minh'),
(2, 'Công ty Prime Tech', 'employer@job.com', '123456', 'employer', '0901000000', 'Gò Vấp, HCM'),
(3, 'Nguyễn Văn A', 'candidate@job.com', '123456', 'candidate', '0902000000', 'Thủ Đức, HCM');

INSERT INTO employer_profiles (user_id, company_name, company_slug, company_description, company_website, company_logo) VALUES
(2, 'Prime Tech Solution', 'prime-tech-solution', 'Công ty công nghệ tuyển dụng theo mô hình TopCV, chuyên tuyển dụng lập trình viên và nhân sự kinh doanh.', 'https://example.com', NULL);

INSERT INTO candidate_profiles (user_id, headline, cv_file) VALUES
(3, 'Fresher Web Developer', '/static/uploads/cv/demo-cv.pdf');

INSERT INTO jobs (title, career_id, job_type, user_id, vacancy, salary, job_level, description, benefits, responsibility, qualifications, keywords, experience, company_name, province, district, wards, location_detail, company_website, expiration_date, status, is_featured) VALUES
('Senior Back-End Developer', 13, 'Toàn thời gian', 2, 3, '20 - 30 triệu', 'Senior', '<p>Phát triển REST API bằng Node.js/Express, tối ưu MySQL.</p>', '<p>Thưởng dự án, review lương định kỳ.</p>', '<p>Xây dựng API, review code, phối hợp frontend.</p>', '<p>Biết Node.js, MySQL, JWT.</p>', 'Node.js, Express, MySQL', '3', 'Prime Tech Solution', 'Thành phố Hồ Chí Minh', 'Quận Gò Vấp', 'Phường 17', '318 Nguyễn Oanh, Gò Vấp', 'https://example.com', '2026-12-31', 'approved', 1),
('Front-End Developer', 13, 'Toàn thời gian', 2, 2, '15 - 22 triệu', 'Middle', '<p>Xây dựng giao diện Bootstrap/EJS hoặc React.</p>', '<p>Môi trường trẻ, thiết bị đầy đủ.</p>', '<p>Làm việc với designer và backend.</p>', '<p>Thành thạo HTML, CSS, JS.</p>', 'HTML, CSS, JavaScript', '2', 'Prime Tech Solution', 'Thành phố Hồ Chí Minh', 'Quận Gò Vấp', 'Phường 17', '318 Nguyễn Oanh, Gò Vấp', 'https://example.com', '2026-12-31', 'approved', 1),
('Nhân viên Kinh doanh', 3, 'Toàn thời gian', 2, 5, '10 - 15 triệu', 'Nhân viên', '<p>Tìm kiếm khách hàng và tư vấn dịch vụ.</p>', '<p>Hoa hồng hấp dẫn.</p>', '<p>Chăm sóc khách hàng doanh nghiệp.</p>', '<p>Giao tiếp tốt.</p>', 'Sales, B2B', '1', 'Prime Tech Solution', 'Đà Nẵng', 'Hải Châu', 'Hòa Thuận', 'Trung tâm Đà Nẵng', 'https://example.com', '2026-12-31', 'approved', 0),
('Kế toán tổng hợp', 25, 'Toàn thời gian', 2, 1, '12 - 18 triệu', 'Nhân viên', '<p>Quản lý chứng từ và báo cáo tài chính.</p>', '<p>Bảo hiểm, phụ cấp.</p>', '<p>Làm báo cáo tháng/quý.</p>', '<p>Tốt nghiệp kế toán.</p>', 'Kế toán, Excel', '2', 'Prime Tech Solution', 'Hà Nội', 'Cầu Giấy', 'Dịch Vọng', 'Tòa nhà văn phòng Cầu Giấy', 'https://example.com', '2026-12-31', 'approved', 0),
('Thực tập sinh IT', 31, 'Thực tập', 2, 4, 'Hỗ trợ thực tập', 'Intern', '<p>Hỗ trợ team phát triển phần mềm.</p>', '<p>Đào tạo nội bộ, mentor 1-1.</p>', '<p>Học quy trình dự án, hỗ trợ fix bug.</p>', '<p>Có kiến thức lập trình cơ bản.</p>', 'Intern, IT', '0', 'Prime Tech Solution', 'Thành phố Hồ Chí Minh', 'Thủ Đức', 'Linh Trung', 'Khu công nghệ cao', 'https://example.com', '2026-12-31', 'approved', 0),
('Chuyên viên nhân sự', 35, 'Toàn thời gian', 2, 1, '12 - 16 triệu', 'Nhân viên', '<p>Tuyển dụng và quản trị hồ sơ nhân sự.</p>', '<p>Lương tháng 13.</p>', '<p>Đăng tin tuyển dụng, sàng lọc CV.</p>', '<p>Kỹ năng giao tiếp, tin học văn phòng.</p>', 'HR, tuyển dụng', '2', 'Prime Tech Solution', 'Cần Thơ', 'Ninh Kiều', 'An Hòa', 'Trung tâm Ninh Kiều', 'https://example.com', '2026-12-31', 'approved', 0);
