package com.possilives.main.Model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Entity
@Table(name = "image")
@NoArgsConstructor
@AllArgsConstructor
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String image_id;    @Column(name = "link", nullable = true)
    private String link;

    @Column(name = "createdAt", nullable = false)
    private Date createdAt = new Date();

    @JsonIgnore
    @ManyToOne
    private Generations imageGeneration;

    @Override
    public String toString() {
        return "Image [image_id=" + image_id + ", link=" + link + ", createdAt=" + createdAt + ", imageGeneration="
                + imageGeneration.getGen_id() + "]";
    }
}