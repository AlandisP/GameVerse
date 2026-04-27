package com.GameVerse.GameVerse.selenium;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class ProfilePageUITest {

    WebDriver login() throws InterruptedException {
        WebDriver driver = new ChromeDriver();
        driver.get("http://localhost:3000/login");
        driver.findElement(By.id("userinput")).sendKeys("navbar");
        driver.findElement(By.id("passinput")).sendKeys("1234");
        driver.findElement(By.xpath("//button[contains(text(), 'Login')]")).click();
        Thread.sleep(4000);
        return driver;
    }

    @Test
    void ownProfileLoadsWithEditButton() throws InterruptedException {
        WebDriver driver = login();
        driver.get("http://localhost:3000/profile");
        Thread.sleep(3000);

        WebElement username = driver.findElement(By.xpath("//h1"));
        WebElement editButton = driver.findElement(By.xpath("//button[contains(text(), 'Edit Profile')]"));

        assertTrue(username.isDisplayed());
        assertTrue(editButton.isDisplayed());

        driver.quit();
    }

    @Test
    void postsTabWorks() throws InterruptedException {
        WebDriver driver = login();
        driver.get("http://localhost:3000/profile");
        Thread.sleep(3000);

        driver.findElement(By.xpath("//button[contains(text(), 'Posts')]")).click();
        Thread.sleep(1500);

        WebElement posts = driver.findElement(By.className("com-posts"));
        assertTrue(posts.isDisplayed());

        driver.quit();
    }

    @Test
    void mediaTabSwitches() throws InterruptedException {
        WebDriver driver = login();
        driver.get("http://localhost:3000/profile");
        Thread.sleep(3000);

        driver.findElement(By.xpath("//button[contains(text(), 'Media')]")).click();
        Thread.sleep(1500);

        WebElement content = driver.findElement(By.xpath("//*[contains(text(), 'Media') or contains(text(), 'No Media')]"));
        assertTrue(content.isDisplayed());

        driver.quit();
    }

    @Test
    void likesTabSwitches() throws InterruptedException {
        WebDriver driver = login();
        driver.get("http://localhost:3000/profile");
        Thread.sleep(3000);

        driver.findElement(By.xpath("//button[contains(text(), 'Likes')]")).click();
        Thread.sleep(1500);

        WebElement content = driver.findElement(By.xpath("//*[contains(@class, 'com-posts') or contains(text(), 'No likes')]"));
        assertTrue(content.isDisplayed());

        driver.quit();
    }

    @Test
    void otherProfileHasFollowAndDM() throws InterruptedException {
        WebDriver driver = login();
        driver.get("http://localhost:3000/profile/testuser");
        Thread.sleep(3000);

        WebElement follow = driver.findElement(
            By.xpath("//button[contains(text(), 'Follow') or contains(text(), 'Unfollow') or contains(text(), 'Requested')]")
        );
        WebElement dm = driver.findElement(By.xpath("//button[contains(text(), 'DM')]"));

        assertTrue(follow.isDisplayed());
        assertTrue(dm.isDisplayed());

        driver.quit();
    }

    @Test
    void privateProfileShowsRestriction() throws InterruptedException {
        WebDriver driver = login();
        driver.get("http://localhost:3000/profile/testprivate");
        Thread.sleep(3000);

        WebElement privateText = driver.findElement(
            By.xpath("//*[contains(text(), 'Private') or contains(text(), 'Account is Private')]")
        );

        assertTrue(privateText.isDisplayed());

        driver.quit();
    }
}