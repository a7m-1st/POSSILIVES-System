package com.possilives.main.Model;

import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "generations")
@NoArgsConstructor
@AllArgsConstructor
public class Generations {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String gen_id;

  private String title;

  @Column(columnDefinition = "TEXT")
  private String description;
  private String note;

  @Column(name = "createdAt", nullable = false)
  private Date createdAt = new Date();

  @Column(name = "modifiedAt", nullable = false)
  private Date modifiedAt = new Date();

  
  @OneToMany(mappedBy = "imageGeneration", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
  private List<Image> images;

  @ManyToOne
  @JsonIgnore
  private Users generatedBy;

  public String getGen_id() {
    return gen_id;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getNote() {
    return note;
  }

  public void setNote(String note) {
    this.note = note;
  }

  public Date getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Date createdAt) {
    this.createdAt = createdAt;
  }

  public Date getModifiedAt() {
    return modifiedAt;
  }

  public void setModifiedAt(Date modifiedAt) {
    this.modifiedAt = modifiedAt;
  }

  public List<Image> getImages() {
    return images;
  }

  public void setImages(List<Image> images) {
    this.images = images;
  }

  public Users getGeneratedBy() {
    return generatedBy;
  }

  public void setGeneratedBy(Users generatedBy) {
    this.generatedBy = generatedBy;
  }

  @Override
  public String toString() {
    return "Generations [title=" + title + ", description=" + description + ", note=" + note + ", createdAt="
        + createdAt
        + ", modifiedAt=" + modifiedAt + ", images=" + images + ", generatedBy=" + generatedBy.getUser_id() + "]";
  }
}
