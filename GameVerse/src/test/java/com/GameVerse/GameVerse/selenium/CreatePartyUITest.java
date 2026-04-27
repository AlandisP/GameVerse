package com.GameVerse.GameVerse.selenium;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class CreatePartyUITest {

    @Test
    void userCanCreateAParty() throws InterruptedException {
        WebDriver driver = new ChromeDriver();

        driver.get("http://localhost:3000/login");
        driver.findElement(By.id("userinput")).sendKeys("navbar");
        driver.findElement(By.id("passinput")).sendKeys("1234");
        driver.findElement(By.xpath("//button[contains(text(), 'Login')]")).click();
        Thread.sleep(4000);

        driver.get("http://localhost:3000/partyfinder");

        driver.findElement(By.xpath("//button[contains(text(), 'Create Party')]")).click();
        Thread.sleep(1500);

        driver.findElement(By.xpath("//input[@placeholder='Enter Party Name']")).sendKeys("Selenium Test Party");
        driver.findElement(By.xpath("//input[@placeholder='Enter Party Description']")).sendKeys("UI Test Party");
        driver.findElement(By.xpath("//input[@placeholder='Enter Number of Members']")).sendKeys("4");
        driver.findElement(By.xpath("//input[@placeholder='Enter time until party is active']")).sendKeys("60");

        driver.findElement(By.cssSelector(".catbox2")).click();
        driver.findElement(By.xpath("//button[contains(text(), 'Create')]")).click();

        Thread.sleep(3000);

        WebElement partyName = driver.findElement(By.xpath("//*[contains(text(), 'Selenium Test Party')]"));
        assertTrue(partyName.isDisplayed());

        driver.quit();
    }
}
