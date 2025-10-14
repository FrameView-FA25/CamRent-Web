import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <div className="page">
      <h1>404 - Trang không tìm thấy</h1>
      <p>Trang bạn đang tìm kiếm không tồn tại.</p>
      <Link to="/" style={{ color: "#3b82f6", textDecoration: "underline" }}>
        Quay về trang chủ
      </Link>
    </div>
  );
};

export default NotFoundPage;
